class Api::V1::AccountsController < Api::V1::ApplicationController
    before_action :user_authorize_request
    def list
        raise SecurityTransgression unless @current_user.can_do?("GET_ACCOUNT")

        items = Account.active
        query = params.permit(:page,:size,:order,:sort,:keywords,:status,:created_from,:created_to)
        page = query[:page].present? ? query[:page] : 1
        size = query[:size].present? ? query[:size] : 25
        if query[:keywords].present?
            items = items.where("bank LIKE ? ","%#{query[:keywords]}%")
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
        raise SecurityTransgression unless @current_user.can_do?("GET_ACCOUNT")
        item_id = params[:item_id]
        item = Account.active.find(item_id.to_i)
        
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
        form = params.permit(:bank, :remark, :is_default)
        item = Account.new(form)

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
        item = Account.active.find(item_id.to_i)
        raise SecurityTransgression unless @current_user.can_update?(item)
        form = params.permit(:bank, :remark, :is_default)
        item.assign_attributes(form)

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
        item = Account.active.find(item_id.to_i)
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

    private 

    def ReturnFormat(item)
        
        result = item.attributes.except('is_deleted')
        result
    end
end
