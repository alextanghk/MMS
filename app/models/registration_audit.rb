class RegistrationAudit < ApplicationRecord
  belongs_to :registration

  # Payment method
  # Cash
  # Cheque
  # Online Payment
  validates :payment_method, inclusion: { in:["Cash","Cheque","Online Payment"], message: "field_error_value_invalid"}, allow_nil: true, allow_blank: true

  validates :receipt_no, uniqueness:  { message: "field_error_unique"}, allow_nil: true, allow_blank: true
end
