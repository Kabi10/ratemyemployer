| table_name   | column_name         | data_type                | is_nullable | column_default               |
| ------------ | ------------------- | ------------------------ | ----------- | ---------------------------- |
| admins       | id                  | uuid                     | NO          | gen_random_uuid()            |
| admins       | user_id             | uuid                     | NO          | null                         |
| admins       | created_at          | timestamp with time zone | NO          | timezone('utc'::text, now()) |
| companies    | id                  | bigint                   | NO          | null                         |
| companies    | name                | character varying        | NO          | null                         |
| companies    | description         | text                     | YES         | null                         |
| companies    | industry            | character varying        | YES         | null                         |
| companies    | location            | character varying        | YES         | null                         |
| companies    | website             | character varying        | YES         | null                         |
| companies    | logo_url            | text                     | YES         | null                         |
| companies    | verification_status | character varying        | YES         | 'pending'::character varying |
| companies    | verified            | boolean                  | YES         | false                        |
| companies    | created_by          | uuid                     | YES         | null                         |
| companies    | created_at          | timestamp with time zone | YES         | now()                        |
| companies    | updated_at          | timestamp with time zone | YES         | now()                        |
| company_news | id                  | uuid                     | NO          | uuid_generate_v4()           |
| company_news | company_name        | text                     | NO          | null                         |
| company_news | title               | text                     | NO          | null                         |
| company_news | description         | text                     | YES         | null                         |
| company_news | url                 | text                     | YES         | null                         |
| company_news | published_at        | timestamp with time zone | YES         | null                         |
| company_news | source              | text                     | YES         | null                         |
| company_news | relevance_score     | double precision         | YES         | null                         |
| company_news | cached_at           | timestamp with time zone | YES         | now()                        |
| profiles     | id                  | uuid                     | NO          | null                         |
| profiles     | created_at          | timestamp with time zone | YES         | now()                        |
| profiles     | updated_at          | timestamp with time zone | YES         | now()                        |
| profiles     | username            | text                     | YES         | null                         |
| profiles     | avatar_url          | text                     | YES         | null                         |
| profiles     | website             | text                     | YES         | null                         |
| reviews      | id                  | bigint                   | NO          | null                         |
| reviews      | company_id          | bigint                   | YES         | null                         |
| reviews      | user_id             | uuid                     | YES         | null                         |
| reviews      | title               | character varying        | NO          | null                         |
| reviews      | rating              | integer                  | YES         | null                         |
| reviews      | pros                | text                     | NO          | null                         |
| reviews      | cons                | text                     | NO          | null                         |
| reviews      | employment_status   | character varying        | YES         | null                         |
| reviews      | position            | character varying        | YES         | null                         |
| reviews      | is_current_employee | boolean                  | YES         | null                         |
| reviews      | reviewer_name       | character varying        | YES         | null                         |
| reviews      | reviewer_email      | character varying        | YES         | null                         |
| reviews      | status              | character varying        | YES         | 'pending'::character varying |
| reviews      | created_at          | timestamp with time zone | YES         | now()                        |
| reviews      | updated_at          | timestamp with time zone | YES         | now()                        |
| reviews      | reviewer_id         | uuid                     | YES         | null                         |