#!/usr/bin/env python3
"""Offline contract checks only; never connects to Supabase or Twilio."""
import pathlib, re, unittest
ROOT=pathlib.Path(__file__).resolve().parent.parent/'supabase'/'migrations'
FILES={key: next(ROOT.glob('20261108000'+key+'*.sql')).read_text() for key in ('500','600','700','800')}
class Contract(unittest.TestCase):
    def test_exact_four_new_functions(self):
        for key, names in {'500':['prepare_reservation_staff_intervention_sms','complete_reservation_staff_intervention_sms'],'600':['resolve_reservation_staff_intervention_after_booking'],'700':['record_verified_staff_intervention_guest_selection'],'800':['apply_verified_staff_intervention_selected_time']}.items():
            self.assertEqual(re.findall(r'CREATE FUNCTION public\.(\w+)',FILES[key]),names)
    def test_locks_conversation_before_reservation(self):
        for key,sql in FILES.items():
            parts=re.split(r'CREATE FUNCTION public\.',sql)[1:]
            for part in parts:
                conv=re.search(r'(?:SELECT \* INTO v_(?:conv|conversation)|SELECT \* INTO v_conv) FROM public\.reservation_shared_conversations',part)
                res=re.search(r'(?:SELECT \* INTO v_res|PERFORM 1) FROM public\.reservation_requests',part)
                self.assertIsNotNone(conv, key)
                self.assertIsNotNone(res, key)
                self.assertLess(conv.start(),res.start(),key)
    def test_shared_ledger_only(self):
        for key in ('500','700'):
            self.assertIn('public.reservation_shared_sms_operations',FILES[key])
            self.assertNotIn('public.reservation_staff_sms_operations',FILES[key])
    def test_prepared_offer_exclusion(self):
        self.assertIn('public.reservation_alternative_offers',FILES['500'])
        self.assertIn('public.amend_reservation_datetime',FILES['800'])
    def test_guest_reply_has_strong_correlation(self):
        sql=FILES['700']
        for needle in ('reservation_shared_inbound_events','message_created_at','outbound_operation_id','client_request_id','twilio_message_sid','completed_at','v_inbound_created_at <= v_outbound.completed_at',"op.status = 'accepted'",'conversation_id = p_conversation_id','manager_id'):
            self.assertIn(needle,sql)
    def test_resolution_effective_time_and_verification(self):
        sql=FILES['600']
        for needle in ('v_work.accepted_time IS NOT NULL','guest_choice,selected_time','request_status <> \'confirmed\'','status = \'resolved\''):
            self.assertIn(needle,sql)
    def test_role_and_mode_fences(self):
        for key in FILES:
            self.assertIn("'reservation_agent'",FILES[key]) if key!='700' else self.assertIn("'reservation_agent'",FILES[key])
            self.assertIn("'staff'",FILES[key])
            self.assertIn('p_expected_mode_version',FILES[key])
    def test_no_legacy_schema_mutations(self):
        for key,sql in FILES.items():
            self.assertNotRegex(sql,r'(?i)\b(?:DROP|ALTER)\s+(?:TABLE|FUNCTION)\b')
            self.assertNotRegex(sql,r'(?i)\bCREATE\s+TABLE\b')
if __name__=='__main__': unittest.main(verbosity=2)