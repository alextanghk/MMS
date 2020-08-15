class Claim < ApplicationRecord
    has_paper_trail
    
    belongs_to :claim_transaction, class_name: 'Transaction', optional: true

    scope :active, -> { where(is_deleted: false) }

    validates :invoice_number, presence: { message: "field_error_required"}
    validates :item_name, presence: { message: "field_error_required"}
    validates :paid_at, presence: { message: "field_error_required"}
    validates :paid_by, presence: { message: "field_error_required"}
    validates :amount, presence: { message: "field_error_required"}
    validates :payment_method, presence: { message: "field_error_required"}
    
    validates :status, inclusion: { in:["New","Approved","Handled","Rejected","Cancelled"], message: "field_error_value_invalid", allow_nil: true}
    validates :approved_by, presence: { message: "field_error_required", if: :approved_item? }
    validates :approved_at, presence: { message: "field_error_required", if: :approved_item? }
    validates :handled_by, presence: { message: "field_error_required", if: :handled_item? }
    validates :handled_at, presence: { message: "field_error_required", if: :handled_item? }

    Paperclip.interpolates :uuid do |attachment, style|
        attachment.instance.uuid
    end
    
    if Rails.env.prodction?
        has_attached_file :receipt, 
            :styles => { thumb: "100x100>" },
            :storage => :fog,
            fog_credentials: {
                google_storage_access_key_id: ENV.fetch('GOOGLE_STORAGE_ID'),
                google_storage_secret_access_key: ENV.fetch('GOOGLE_STORAGE_SECRET'),
                provider: 'Google' },
            fog_directory: ENV.fetch('GOOGLE_STORAGE_BUCKET'),
            :path => "claims/receipt/:uuid/:style/:filename", # :path => ":rails_root/public/uploads/claims/receipt/:uuid/:style/:filename", 
            :url => ENV["BASE_URL"]+"/uploads/claims/receipt/:uuid/:style/:filename"
    else
        has_attached_file :receipt, 
            :styles => { thumb: "100x100>" },
            :path => ":rails_root/public/uploads/claims/receipt/:uuid/:style/:filename", 
            :url => ENV["BASE_URL"]+"/uploads/claims/receipt/:uuid/:style/:filename"
    end

    validates_attachment_content_type :receipt, content_type: ['image/jpeg', 'image/png', 'application/pdf'], size: { less_than: 5.megabytes }

    before_create do
        self.uuid = loop do
            random_token = SecureRandom.urlsafe_base64(10, false)
            break random_token unless self.class.exists?(uuid: random_token)
        end
    end


    # Validation checking
    def approved_item?
        is_approved
    end

    def handled_item?
        is_handled
    end

    # Access checking

    def can_be_created_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","POST_CLAIM"])
    end

    def can_be_updated_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","PUT_CLAIM"])
    end

    def can_be_deleted_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","DELETE_CLAIM"])
    end

    def can_be_approved_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","APPROVE_CLAIM"])
    end

    def can_be_rejected_by?(user)
        return true if user.user_group.access_rights.exists?(code: ["ALL_REQUEST","REJECT_CLAIM"])
    end
end
