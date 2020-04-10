require 'openssl'
require 'base64'

class Transaction < ApplicationRecord
  belongs_to :account

  scope :active, -> { where(is_deleted: false) }
  scope :active_and_approved, -> { where({is_deleted: false,is_approved: true}) }

  validates :invoice_number, presence: { message: "field_error_required"}
  validates :item_name, presence: { message: "field_error_required"}
  validates :transaction_date, presence: { message: "field_error_required"}
  validates :amount, presence: { message: "field_error_required"}
  validates :approved_by, presence: { message: "field_error_required", if: :approved_item? }
  validates :approved_at, presence: { message: "field_error_required", if: :approved_item? }

  if Rails.env.production?
    has_attached_file :receipt, 
      styles: { thumb: "100x100>" },
      :storage => :fog,
      fog_credentials: {
          google_storage_access_key_id: ENV.fetch('GOOGLE_STORAGE_ID'),
          google_storage_secret_access_key: ENV.fetch('GOOGLE_STORAGE_SECRET'),
          provider: 'Google' },
      fog_directory: ENV.fetch('GOOGLE_STORAGE_BUCKET'),
      :path => "transit/receipt/:uuid/:style/:filename", # :path => ":rails_root/public/uploads/transit/receipt/:uuid/:style/:filename", 
      :url => ENV["BASE_URL"]+"/uploads/transit/receipt/:uuid/:style/:filename"
  else
    has_attached_file :receipt, 
      styles: { thumb: "100x100>" },
      :path => ":rails_root/public/uploads/transit/receipt/:uuid/:style/:filename", 
      :url => ENV["BASE_URL"]+"/uploads/transit/receipt/:uuid/:style/:filename"
  end

  validates_attachment_content_type :receipt, content_type: /\Aimage\/.*\z/
    
  before_create do
    self.uuid = loop do
        random_token = SecureRandom.urlsafe_base64(10, false)
        break random_token unless self.class.exists?(uuid: random_token)
    end
  end

  after_save do
    Account.active.each do |acc|
      acc.update_attribute(:balance, acc.transactions.active_and_approved.sum(:amount))
    end
  end

  # Validation checking
  def approved_item?
    is_approved
  end

  # Access checking

  def can_be_created_by?(user)
    return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","POST_TRANSACTION"])
  end

  def can_be_updated_by?(user)
      return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","PUT_TRANSACTION"])
  end

  def can_be_deleted_by?(user)
      return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","DELETE_TRANSACTION"])
  end
end
