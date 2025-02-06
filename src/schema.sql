| table_name   | column_name         | data_type                | is_nullable | column_default               |
| ------------ | ------------------- | ------------------------ | ----------- | ---------------------------- |
| admins       | id                  | uuid                     | NO          | gen_random_uuid()            |
| admins       | user_id             | uuid                     | NO          |                              |
| admins       | created_at          | timestamp with time zone | NO          | timezone('utc'::text, now()) |
| companies    | id                  | bigint                   | NO          |                              |
| companies    | name                | character varying        | NO          |                              |
| companies    | description         | text                     | YES         |                              |
| companies    | industry            | character varying        | YES         |                              |
| companies    | location            | character varying        | YES         |                              |
| companies    | website             | character varying        | YES         |                              |
| companies    | logo_url            | text                     | YES         |                              |
| companies    | verification_status | character varying        | YES         | 'pending'::character varying |
| companies    | verified            | boolean                  | YES         | false                        |
| companies    | created_by          | uuid                     | YES         |                              |
| companies    | created_at          | timestamp with time zone | YES         | now()                        |
| companies    | updated_at          | timestamp with time zone | YES         | now()                        |
| company_news | id                  | uuid                     | NO          | uuid_generate_v4()           |
| company_news | company_name        | text                     | NO          |                              |
| company_news | title               | text                     | NO          |                              |
| company_news | description         | text                     | YES         |                              |
| company_news | url                 | text                     | YES         |                              |
| company_news | published_at        | timestamp with time zone | YES         |                              |
| company_news | source              | text                     | YES         |                              |
| company_news | relevance_score     | double precision         | YES         |                              |
| company_news | cached_at           | timestamp with time zone | YES         | now()                        |
| profiles     | id                  | uuid                     | NO          |                              |
| profiles     | created_at          | timestamp with time zone | YES         | now()                        |
| profiles     | updated_at          | timestamp with time zone | YES         | now()                        |
| profiles     | username            | text                     | YES         |                              |
| profiles     | avatar_url          | text                     | YES         |                              |
| profiles     | website             | text                     | YES         |                              |
| reviews      | id                  | bigint                   | NO          |                              |
| reviews      | company_id          | bigint                   | YES         |                              |
| reviews      | user_id             | uuid                     | YES         |                              |
| reviews      | title               | character varying        | NO          |                              |
| reviews      | rating              | integer                  | YES         |                              |
| reviews      | pros                | text                     | NO          |                              |
| reviews      | cons                | text                     | NO          |                              |
| reviews      | employment_status   | character varying        | YES         |                              |
| reviews      | position            | character varying        | YES         |                              |
| reviews      | is_current_employee | boolean                  | YES         |                              |
| reviews      | reviewer_name       | character varying        | YES         |                              |
| reviews      | reviewer_email      | character varying        | YES         |                              |
| reviews      | status              | character varying        | YES         | 'pending'::character varying |
| reviews      | created_at          | timestamp with time zone | YES         | now()                        |
| reviews      | updated_at          | timestamp with time zone | YES         | now()                        |
| reviews      | reviewer_id         | uuid                     | YES         |                              |