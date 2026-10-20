"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const INVITE_ERROR_URL =
  "/admin/login?error=invalid-invitation";

const UNAUTHORIZED_URL =
  "/admin/login?error=unauthorized";

const ACCEPT_INVITE_URL = "/admin/accept-invite";

export default function ManagerInviteRedirect() {
  useEffect(() => {
    const hash = window.location.hash;

    if (!hash || !hash.startsWith("#")) {
      return;
    }

    const params = new URLSearchParams(hash.slice(1));

    // Ignore URL fragments unrelated to invitations.
    if (params.get("type") !== "invite") {
      return;
    }

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const invitationError = params.get("error");

    // Remove authentication credentials from the visible URL
    // before performing any asynchronous operations.
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );

    if (invitationError || !accessToken || !refreshToken) {
      window.location.replace(INVITE_ERROR_URL);
      return;
    }

    async function processInvitation() {
      try {
        const supabase = createSupabaseBrowserClient();

        // Supabase validates the supplied session credentials.
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: accessToken!,
            refresh_token: refreshToken!,
          });

        if (
          sessionError ||
          !sessionData.session ||
          !sessionData.user
        ) {
          window.location.replace(INVITE_ERROR_URL);
          return;
        }

        // Independently retrieve the authenticated user.
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          window.location.replace(INVITE_ERROR_URL);
          return;
        }

        // The account must have originated from an invitation.
        // This is an eligibility check, not proof of a fresh
        // invitation authentication event.
        if (!user.invited_at) {
          await supabase.auth.signOut();
          window.location.replace(INVITE_ERROR_URL);
          return;
        }

        // Confirm that the authenticated user has an active
        // manager role before proceeding to account setup.
        const { data: staffRole, error: roleError } =
          await supabase
            .from("staff_roles")
            .select("user_id, role, is_active")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .maybeSingle();

        if (
          roleError ||
          !staffRole ||
          staffRole.user_id !== user.id ||
          staffRole.role !== "manager" ||
          !staffRole.is_active
        ) {
          await supabase.auth.signOut();
          window.location.replace(UNAUTHORIZED_URL);
          return;
        }

        // The destination independently verifies authentication
        // and manager authorization on the server.
        window.location.replace(ACCEPT_INVITE_URL);
      } catch (error) {
        console.error(
          "Manager invitation processing failed:",
          error instanceof Error
            ? error.name
            : "unknown-error",
        );

        window.location.replace(INVITE_ERROR_URL);
      }
    }

    void processInvitation();
  }, []);

  return null;
}