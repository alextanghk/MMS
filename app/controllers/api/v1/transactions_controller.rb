class Api::V1::TransactionsController < Api::V1::ApplicationController
    before_action :user_authorize_request
    def list
        raise SecurityTransgression unless @current_user.can_do?("GET_TRANSACTION")

        items = Transition.active
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
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def get
        raise SecurityTransgression unless @current_user.can_do?("GET_TRANSACTION")
        item_id = params[:item_id]
        item = Transition.active.find(item_id.to_i)
        
        render json: {
            message: "success",
            error: nil,
            data: ReturnFormat(item)
        }
        rescue ActiveRecord::RecordNotFound => e
            render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
        rescue => e
            render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def create 
        form = params.permit(:receipt, :account_id, :invoice_number, :item_name, :description, :transaction_date, :amount)
        account_id = form[:account_id]
        account = Account.active.find(account_id.to_i)
        
        item = Transition.new(form)

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

        rescue => e
            render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def update
        item_id = params[:item_id]
        item = Transition.active.find(item_id.to_i)
        raise SecurityTransgression unless @current_user.can_update?(item)
        form = params.permit(:receipt, :account_id, :invoice_number, :item_name, :description, :transaction_date, :amount)
        account_id = form[:account_id]
        account = Account.active.find(account_id.to_i)

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
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def delete
        item_id = params[:item_id]
        item = Transition.active.find(item_id.to_i)
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
        result[:account] = item.account
        result
    end

end
