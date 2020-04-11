# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_03_22_163314) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "access_rights", force: :cascade do |t|
    t.string "code", null: false
    t.string "displayname", null: false
    t.string "function", null: false
    t.string "category", null: false
    t.integer "func_weight", default: 0, null: false
    t.integer "cat_weight", default: 0, null: false
    t.integer "weight", default: 0, null: false
    t.boolean "is_display", default: false
    t.boolean "is_deleted", default: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["code"], name: "index_access_rights_on_code"
  end

  create_table "accounts", force: :cascade do |t|
    t.string "bank", null: false
    t.string "bank_no"
    t.decimal "balance", precision: 12, scale: 2
    t.text "remark"
    t.boolean "is_default", default: false
    t.boolean "is_actived", default: true
    t.boolean "is_deleted", default: false
    t.string "created_by"
    t.string "updated_by"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "claims", force: :cascade do |t|
    t.bigint "claim_transaction_id"
    t.string "uuid"
    t.string "invoice_number", null: false
    t.string "item_name", null: false
    t.string "description"
    t.string "provider"
    t.string "paid_by"
    t.datetime "paid_at"
    t.datetime "transaction_date"
    t.string "approved_by"
    t.string "approved_at"
    t.string "handled_by"
    t.string "handled_at"
    t.string "payment_method"
    t.string "item_type"
    t.decimal "amount", precision: 10, scale: 2
    t.string "receipt_file_name"
    t.string "receipt_content_type"
    t.bigint "receipt_file_size"
    t.datetime "receipt_updated_at"
    t.string "status", default: "New"
    t.boolean "is_approved", default: false
    t.boolean "is_handled", default: false
    t.boolean "is_deleted", default: false
    t.string "created_by"
    t.string "updated_by"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["claim_transaction_id"], name: "index_claims_on_claim_transaction_id"
  end

  create_table "group_accesses", force: :cascade do |t|
    t.bigint "user_group_id", null: false
    t.bigint "access_right_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["access_right_id"], name: "index_group_accesses_on_access_right_id"
    t.index ["user_group_id"], name: "index_group_accesses_on_user_group_id"
  end

  create_table "members", force: :cascade do |t|
    t.string "uuid", limit: 50, null: false
    t.string "zh_surname", null: false
    t.string "en_surname", null: false
    t.string "zh_first_name", null: false
    t.string "en_first_name", null: false
    t.string "member_ref"
    t.string "gender"
    t.string "email"
    t.string "password_digest"
    t.string "mobile"
    t.string "home_phone"
    t.string "home_address"
    t.string "hkid"
    t.string "comnpany"
    t.string "department"
    t.string "job_title"
    t.string "employment_terms"
    t.string "office_address"
    t.string "office_phone"
    t.string "emergency_contact"
    t.string "emergency_relation"
    t.string "emergency_number"
    t.integer "yob"
    t.date "dob"
    t.boolean "subscription", default: true
    t.boolean "sent_group_invite", default: false
    t.boolean "is_deleted", default: false
    t.boolean "is_actived", default: false
    t.string "profile_file_name"
    t.string "profile_content_type"
    t.bigint "profile_file_size"
    t.datetime "profile_updated_at"
    t.text "remark"
    t.string "created_by"
    t.string "updated_by"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["email"], name: "index_members_on_email"
    t.index ["en_first_name"], name: "index_members_on_en_first_name"
    t.index ["en_surname"], name: "index_members_on_en_surname"
    t.index ["member_ref"], name: "index_members_on_member_ref"
    t.index ["uuid"], name: "index_members_on_uuid"
    t.index ["zh_first_name"], name: "index_members_on_zh_first_name"
    t.index ["zh_surname"], name: "index_members_on_zh_surname"
  end

  create_table "registration_audits", force: :cascade do |t|
    t.bigint "registration_id", null: false
    t.string "payment_method"
    t.boolean "paid", default: false
    t.datetime "paid_at"
    t.string "receipt_no"
    t.boolean "sent_confirmation", default: false
    t.boolean "sent_payment_note", default: false
    t.boolean "sent_receipt", default: false
    t.boolean "is_deleted", default: false
    t.string "created_by"
    t.string "updated_by"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["registration_id"], name: "index_registration_audits_on_registration_id"
  end

  create_table "registrations", force: :cascade do |t|
    t.bigint "member_id"
    t.string "zh_surname", null: false
    t.string "en_surname", null: false
    t.string "zh_first_name", null: false
    t.string "en_first_name", null: false
    t.string "hkid", null: false
    t.string "email"
    t.string "gender"
    t.string "mobile"
    t.integer "yob"
    t.date "dob"
    t.string "home_phone"
    t.string "home_address"
    t.boolean "declare", default: false
    t.boolean "agreement", default: false
    t.string "status", default: "New"
    t.boolean "is_valid", default: false
    t.text "remark"
    t.string "uuid", limit: 50, null: false
    t.string "comnpany"
    t.string "department"
    t.string "job_title"
    t.string "employment_terms"
    t.string "office_address"
    t.string "office_phone"
    t.string "proof_file_name"
    t.string "proof_content_type"
    t.bigint "proof_file_size"
    t.datetime "proof_updated_at"
    t.boolean "is_deleted", default: false
    t.string "created_by"
    t.string "updated_by"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["email"], name: "index_registrations_on_email"
    t.index ["en_first_name"], name: "index_registrations_on_en_first_name"
    t.index ["en_surname"], name: "index_registrations_on_en_surname"
    t.index ["hkid"], name: "index_registrations_on_hkid"
    t.index ["member_id"], name: "index_registrations_on_member_id"
    t.index ["uuid"], name: "index_registrations_on_uuid"
    t.index ["zh_first_name"], name: "index_registrations_on_zh_first_name"
    t.index ["zh_surname"], name: "index_registrations_on_zh_surname"
  end

  create_table "system_configs", force: :cascade do |t|
    t.string "code"
    t.string "display_name"
    t.text "content"
    t.boolean "is_deleted", default: false
    t.string "created_by"
    t.string "updated_by"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "transactions", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.string "uuid"
    t.string "invoice_number", null: false
    t.string "item_name", null: false
    t.string "payment_method"
    t.string "provider"
    t.string "item_type"
    t.string "description"
    t.datetime "transaction_date"
    t.string "receipt_file_name"
    t.string "receipt_content_type"
    t.bigint "receipt_file_size"
    t.datetime "receipt_updated_at"
    t.string "approved_by"
    t.string "approved_at"
    t.decimal "amount", precision: 10, scale: 2
    t.boolean "is_approved", default: false
    t.boolean "is_deleted", default: false
    t.string "created_by"
    t.string "updated_by"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["account_id"], name: "index_transactions_on_account_id"
  end

  create_table "user_groups", force: :cascade do |t|
    t.string "name", null: false
    t.text "remark"
    t.boolean "is_deleted", default: false
    t.string "created_by"
    t.string "updated_by"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["name"], name: "index_user_groups_on_name"
  end

  create_table "user_tokens", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "token", null: false
    t.datetime "exp_date"
    t.string "auth_type"
    t.string "login_ip"
    t.boolean "is_deleted", default: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["token"], name: "index_user_tokens_on_token"
    t.index ["user_id"], name: "index_user_tokens_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.bigint "user_group_id", null: false
    t.string "zh_name", null: false
    t.string "en_name", null: false
    t.string "user_name", null: false
    t.string "email"
    t.string "password_digest"
    t.string "mobile"
    t.boolean "is_deleted", default: false
    t.boolean "is_actived", default: false
    t.string "created_by"
    t.string "updated_by"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["email"], name: "index_users_on_email"
    t.index ["en_name"], name: "index_users_on_en_name"
    t.index ["user_group_id"], name: "index_users_on_user_group_id"
    t.index ["user_name"], name: "index_users_on_user_name"
    t.index ["zh_name"], name: "index_users_on_zh_name"
  end

  add_foreign_key "group_accesses", "access_rights"
  add_foreign_key "group_accesses", "user_groups"
  add_foreign_key "registration_audits", "registrations"
  add_foreign_key "registrations", "members"
  add_foreign_key "transactions", "accounts"
  add_foreign_key "user_tokens", "users"
  add_foreign_key "users", "user_groups"
end
