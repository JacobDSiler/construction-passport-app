# Backend contract (recovered from the live web build)

Backend: Supabase project at https://untoyialszpcvpsqujsy.supabase.co (still live; only the client code was lost).
Anon key: public client key, present in the live web bundle. Put it in EXPO_PUBLIC_SUPABASE_ANON_KEY, never commit it.
Auth model: no user accounts. Each device holds an owner token (p_owner_token); companies use a setup token and org code; workers have a short code.
Storage: public bucket "certs"; photos at <ownerPrefix>/<name>.jpg or .png, uploaded with upsert.
Table seen directly: certs. Everything else goes through the RPC functions below (57 call sites).

## RPC calls and arguments as the old client sent them
- rpc("accept_crew",{p_owner_token:t,p_org_code:e.trim().toUpperCase(),p_short_code:r.trim().toUpperCase()}
- rpc("add_crew_member",{p_owner_token:n,p_org_code:e.trim().toUpperCase(),p_short_code:r.trim().toUpperCase(),p_type:t?.type??"employee",p_assignment:t?.assignment??"crew"}
- rpc("add_timesheet_event",{p_owner_token:r,p_short_code:e.shortCode,p_kind:e.kind,p_at:e.at,p_site:e.site??null,p_employer:e.employer??null,p_note:e.note??null,p_org_code:e.orgCode??null}
- rpc("add_verification",{p_short_code:e.trim().toUpperCase(),p_verified_by:r,p_contact:t}
- rpc("adopt_rotated_token",{p_old:e}
- rpc("certifier_login",{p_code:e.trim()}
- rpc("certify_passport",{p_code:e.trim(),p_short_code:r.trim().toUpperCase()}
- rpc("claim_company",{p_claim_code:e.trim().toUpperCase(),p_owner_token:r}
- rpc("claim_passport",{p_owner_token:e}
- rpc("claim_worker",{p_claim_code:e.trim().toUpperCase()}
- rpc("clear_verifications",{p_owner_token:e}
- rpc("create_company",{p_setup_token:t,p_name:e.trim(),p_trade:r??null}
- rpc("create_site",{p_owner_token:r,p_org_code:e.orgCode,p_name:e.name,p_location:e.location??null,p_lat:e.lat??null,p_lng:e.lng??null}
- rpc("delete_company",{p_setup_token:r,p_org_code:e}
- rpc("delete_course",{p_owner_token:r,p_id:e}
- rpc("delete_expense",{p_owner_token:r,p_id:e}
- rpc("delete_provisioned",{p_owner_token:r,p_id:e}
- rpc("delete_site",{p_owner_token:r,p_id:e}
- rpc("delete_timesheet_event",{p_owner_token:r,p_id:e}
- rpc("dismiss_suggestion",{p_owner_token:r,p_id:e}
- rpc("employer_upload_cert",{p_short_code:e.shortCode.trim().toUpperCase(),p_employer_name:e.employerName,p_cert_name:e.certName,p_issuer:e.issuer??null,p_expires:e.expires??null,p_image_url:e.imageUrl??null,p_image_back_url:e.imageBackUrl??null}
- rpc("enroll_course",{p_course_code:e.courseCode.trim().toUpperCase(),p_short_code:e.shortCode??null,p_name:e.name,p_address:e.address??null,p_phone:e.phone??null,p_email:e.email??null,p_answers:e.answers}
- rpc("get_app_certification",{p_code:e.trim().toUpperCase()}
- rpc("get_course",{p_course_code:e.trim().toUpperCase()}
- rpc("get_employer_uploads",{p_owner_token:e}
- rpc("get_expenses_by_code",{p_short_code:e.trim().toUpperCase(),p_from:r,p_to:t,p_org_code:n.trim().toUpperCase()}
- rpc("get_my_suggestions",{p_owner_token:e}
- rpc("get_passport",{p_code:r}
- rpc("get_timesheet",{p_short_code:e.trim().toUpperCase(),p_from:r,p_to:t,p_org_code:n.trim().toUpperCase()}
- rpc("get_upload_consent",{p_code:e.trim().toUpperCase()}
- rpc("get_verifications",{p_code:e}
- rpc("list_companies",{p_setup_token:e}
- rpc("list_courses",{p_owner_token:e}
- rpc("list_crew",{p_org_code:e.trim().toUpperCase()}
- rpc("list_enrollments",{p_owner_token:r,p_course_code:e.trim().toUpperCase()}
- rpc("list_expenses",{p_org_code:e.trim().toUpperCase()}
- rpc("list_hazards",{p_org_code:e.trim().toUpperCase()}
- rpc("list_provisioned",{p_owner_token:e}
- rpc("list_review_passports",{p_code:e.trim()}
- rpc("list_sites",{p_org_code:e.trim().toUpperCase()}
- rpc("peek_company",{p_claim_code:e.trim().toUpperCase()}
- rpc("provision_worker",{p_owner_token:r,p_org_code:e.orgCode.trim().toUpperCase(),p_claim_code:e.claimCode??null,p_name:e.name??null,p_trade:e.trade??null,p_certs:e.certs??[],p_type:e.type??"employee",p_assignment:e.assignment??"crew"}
- rpc("publish_passport",{p_owner_token:r,p_data:e}
- rpc("remove_crew_member",{p_owner_token:t,p_org_code:e.trim().toUpperCase(),p_short_code:r.trim().toUpperCase()}
- rpc("remove_enrollment",{p_owner_token:r,p_id:e}
- rpc("request_join",{p_org_code:e.trim().toUpperCase(),p_short_code:r.trim().toUpperCase(),p_name:t??null,p_type:n?.type??null,p_assignment:n?.assignment??null}
- rpc("resolve_hazard",{p_org_code:e.trim().toUpperCase(),p_id:r,p_resolved_by:t??null}
- rpc("revoke_certification",{p_code:e.trim(),p_short_code:r.trim().toUpperCase()}
- rpc("search_courses",{p_cert_type:e}
- rpc("set_crew_member_meta",{p_owner_token:n,p_org_code:e.trim().toUpperCase(),p_short_code:r.trim().toUpperCase(),p_type:t.type??null,p_assignment:t.assignment??null}
- rpc("set_employer_upload_consent",{p_owner_token:r,p_allow:e}
- rpc("set_expense_status",{p_id:e,p_status:r}
- rpc("set_suggestion_consent",{p_owner_token:r,p_allow:e}
- rpc("submit_feedback",{p_kind:e.kind,p_rating:e.rating??null,p_message:e.message??null,p_role:e.role??null,p_context:e.context??null}
- rpc("suggest_course",{p_short_code:e.shortCode.trim().toUpperCase(),p_from_name:e.fromName??null,p_course_code:e.courseCode??null,p_cert_type:e.certType??null,p_title:e.title??null,p_note:e.note??null}
- rpc("suggestion_consent",{p_short_code:e.trim().toUpperCase()}
- rpc("update_company",{p_setup_token:n,p_org_code:e,p_name:r.trim(),p_trade:t??null}

## Added from the live web bundle (second pass, Nov 2026)
Source: the entry bundle served by https://construction-passport-web.netlify.app. These names were called by the live app but missing from the first recovery.

- rpc("create_course", {p_owner_token, p_title, p_provider, p_questionnaire, p_location, p_lat, p_lng, p_signup, p_price, p_cert_type, p_sessions, p_published}). Returns the new course code (the web app navigates to `/course/<code>` with it). Return shape read defensively.
- rpc("update_course", {p_owner_token, p_course_code, ...same fields as create_course}). Returns boolean.
- get_course(p_course_code) returns an array; the first row has title, provider, questionnaire, location, signup, price, cert_type, sessions.
- list_courses rows include course_code, title, provider, location, signup, price, cert_type, published, questionnaire, sessions, enrolled.
- Questionnaire item: `{label, type: "text" | "yesno" | "choice", options?: string[]}`. Options only for "choice".
- Session item: `{date: "YYYY-MM-DD", time?: "HH:MM"}`.
- Names found in the bundle but not yet read for arguments: `new_owner_token`, `restore_passport`, `submit_expense`, `submit_hazard`.
- The bundle also geocodes the venue before create_course (lat/lng). The app does not do that yet; it sends null.
