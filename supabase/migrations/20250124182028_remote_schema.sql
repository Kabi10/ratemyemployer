-- This migration sets a default role for users and grants necessary permissions
-- We'll skip altering the role column type since it's used in policies

-- Set default role for users
alter table "auth"."users" alter column "role" set default 'user'::text;

-- Grant select permission on users table to authenticated users
grant select on table "auth"."users" to "authenticated";

-- Grant permissions for storage tables
grant delete on table "storage"."s3_multipart_uploads" to "postgres";
grant insert on table "storage"."s3_multipart_uploads" to "postgres";
grant references on table "storage"."s3_multipart_uploads" to "postgres";
grant select on table "storage"."s3_multipart_uploads" to "postgres";
grant trigger on table "storage"."s3_multipart_uploads" to "postgres";
grant truncate on table "storage"."s3_multipart_uploads" to "postgres";
grant update on table "storage"."s3_multipart_uploads" to "postgres";

grant delete on table "storage"."s3_multipart_uploads_parts" to "postgres";
grant insert on table "storage"."s3_multipart_uploads_parts" to "postgres";
grant references on table "storage"."s3_multipart_uploads_parts" to "postgres";
grant select on table "storage"."s3_multipart_uploads_parts" to "postgres";
grant trigger on table "storage"."s3_multipart_uploads_parts" to "postgres";
grant truncate on table "storage"."s3_multipart_uploads_parts" to "postgres";
grant update on table "storage"."s3_multipart_uploads_parts" to "postgres";


