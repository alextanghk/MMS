class Api::V1::ClaimsController < Api::V1::ApplicationController
    before_action :user_authorize_request

    def list
        raise SecurityTransgression unless @current_user.can_do?("GET_CLAIM")

        items = Claim.active
        query = params.permit(:page,:size,:order,:sort,:keywords,:status,:created_from,:created_to)
        page = query[:page].present? ? query[:page] : 1
        size = query[:size].present? ? query[:size] : 25
        if query[:keywords].present?
            items = items.where("item_name LIKE ? or invoice_number LIKE ? ","%#{query[:keywords]}%","%#{query[:keywords]}%")
        end
        items = items.order(query[:order] => query[:sort])
        render json: {
            message: "success",
            error: nil,
            count: items.count,
            data: items.paginate(page,size).map  { |row|
                item = ReturnFormat(row)
                item
            }
        }
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def get
        raise SecurityTransgression unless @current_user.can_do?("GET_CLAIM")
        item_id = params[:item_id]
        item = Claim.active.find(item_id.to_i)
        
        render json: {
            message: "success",
            error: nil,
            data: ReturnFormat(item)
        }
    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def create 
        form = params.permit(:receipt, :invoice_number, 
            :item_name, :description, :paid_by, :item_type,
            :amount, :paid_at, :provider, :payment_method, :transaction_date,
            :approved_by, :approved_at, :handled_by, :handled_at
        )
        
        item = Claim.new(form)

        raise SecurityTransgression unless @current_user.can_create?(item)

        if !item.valid?
            render status:500, json: {
                message: "invalid",
                error: item.errors.messages,
                data: nil
            }
            return
        end

        item.save
        
        render json: {
            message: "success",
            error: nil,
            data: ReturnFormat(item)
        }
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def update
        item_id = params[:item_id]
        item = Claim.active.find(item_id.to_i)
        raise SecurityTransgression unless @current_user.can_update?(item)

        form = params.permit(:receipt, :invoice_number, 
            :item_name, :description, :paid_by, :item_type,
            :amount, :paid_at, :provider, :payment_method, :transaction_date,
            :approved_by, :approved_at, :handled_by, :handled_at
        )
        if item.is_approved
            form = params.permit(
                :description, :payment_method, :transaction_date,
                :handled_by, :handled_at
            )
        end

        if item.is_handled
            form = params.permit(
                :description, :payment_method
            )
        end

        item.assign_attributes(form)

        setting = params.permit(:delete_receipt)
        isDeleteFile = setting[:delete_receipt].to_bool

        if isDeleteFile
            item.receipt.clear
        end

        if !item.valid?
            render status:500, json: {
                message: "invalid",
                error: item.errors.messages,
                data: nil
            }
            return
        end

        item.save
        
        render json: {
            message: "success",
            error: nil,
            data: ReturnFormat(item)
        }
        
    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def delete
        item_id = params[:item_id]
        item = Claim.active.find(item_id.to_i)
        raise SecurityTransgression unless @current_user.can_delete?(item)

        item.is_deleted = true
        item.save
        render json: {
            message: "success",
            error: nil,
            data: nil
        }
    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def approve
        raise SecurityTransgression unless @current_user.can_do?("APPROVE_CLAIM")
        item_id = params[:item_id]
        item = Claim.active.find(item_id.to_i)
        if item.is_approved
            render json: { message: "claims_approved" , error: "claims_approved" }, status: :internal_server_error
            return
        end
        if item.status != "New"
            render json: { message: "claim_"+item.status.downcase , error: "claim_"+item.status.downcase }, status: :internal_server_error
            return
        end
        
        item.status = "Approved"
        item.is_approved = true
        if !item.valid?
            render status:500, json: {
                message: "invalid",
                error: item.errors.messages,
                data: nil
            }
            return
        end
        item.save
        render json: {
            message: "success",
            error: nil,
            data: nil
        }
    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def handle
        raise SecurityTransgression unless @current_user.can_do?("HANDLE_CLAIM")
        item_id = params[:item_id]
        item = Claim.active.find(item_id.to_i)
        if item.is_handled
            render json: { message: "claims_handled" , error: "claims_handled" }, status: :internal_server_error
            return
        end
        if !item.is_approved
            render json: { message: "claims_not_approved" , error: "claims_not_approved" }, status: :internal_server_error
            return
        end
        if ["Rejected","Cancelled"].include?(item.status)
            render json: { message: "claim_"+item.status.downcase , error: "claim_"+item.status.downcase }, status: :internal_server_error
            return
        end
        
        trans = Transaction.new({
            :account => Account.find_by(:is_default => true),
            :invoice_number => item.invoice_number,
            :item_name => item.item_name,
            :item_type => item.item_type,
            :payment_method => item.payment_method,
            :approved_by => item.approved_by,
            :provider => item.provider,
            :approved_at => item.approved_at,
            :amount => item.amount*-1,
            :is_approved => true,
            :transaction_date => item.transaction_date,
            :description => item.description,
            :receipt => item.receipt
        }) 

        if !trans.valid?
            render status:500, json: {
                message: "invalid",
                error: trans.errors.messages,
                data: nil
            }
            return
        end
        trans.save
        item.claim_transaction = trans
        item.status = "Handled"
        item.is_handled = true
        if !item.valid?
            render status:500, json: {
                message: "invalid",
                error: item.errors.messages,
                data: nil
            }
            return
        end
        item.save
        render json: {
            message: "success",
            error: nil,
            data: nil
        }
    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def reject
        raise SecurityTransgression unless @current_user.can_do?("REJECT_CLAIM")
        item_id = params[:item_id]
        item = Claim.active.find(item_id.to_i)
        if item.status != "New"
            render json: { message: "claim_"+item.status.downcase , error: "claim_"+item.status.downcase }, status: :internal_server_error
            return
        end

        item.status = "Rejected"
        item.save
        render json: {
            message: "success",
            error: nil,
            data: nil
        }
    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def cancel
        item_id = params[:item_id]
        item = Claim.active.find(item_id.to_i)
        if item.status != "New"
            render json: { message: "claim_"+item.status.downcase , error: "claim_"+item.status.downcase }, status: :internal_server_error
            return
        end
        item.status = "Cancelled"
        item.save
        render json: {
            message: "success",
            error: nil,
            data: nil
        }
    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue ActiveRecord::SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def ReturnFormat(item)
        
        result = item.attributes.except('is_deleted','receipt_file_name','receipt_content_type','receipt_file_size','receipt_updated_at')
        
        if item.receipt_file_name.nil?
            result[:receipt] = nil
        else
            result[:receipt] = {
                :original => item.receipt.url(:original),
                :thumb => item.receipt.url(:thumb)
            }
        end
        result
    end
end
