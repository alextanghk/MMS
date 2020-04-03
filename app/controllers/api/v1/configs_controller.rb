class Api::V1::ConfigsController < Api::V1::ApplicationController
    before_action :user_authorize_request, except: [:get_by_code]

    def list
        raise SecurityTransgression unless @current_user.can_do?("GET_SYS_CONFIG")

        query = params.permit(:page,:size,:order,:sort,:keywords,:status,:created_from,:created_to)
        page = query[:page].present? ? query[:page] : 1
        size = query[:size].present? ? query[:size] : 25

        items = SystemConfig.active

        if query[:keywords].present?
            items = items.where("zh_name LIKE ? OR en_name LIKE ?","%#{query[:keywords]}%", "%#{query[:keywords]}%")
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
        raise SecurityTransgression unless @current_user.can_do?("GET_SYS_CONFIG")
        item_id = params[:item_id]
        item = SystemConfig.active.find(item_id.to_i)
        
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

    def get_by_code
        code = params[:code]
        item = SystemConfig.active.find_by(:code => code)
        
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

    def update
        id = params[:item_id]
        item = SystemConfig.active.find(id.to_i)
        raise SecurityTransgression unless @current_user.can_update?(item)

        form = params.permit(:display_name,:content)
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

    def ReturnFormat(item)
        
        result = item.attributes.except(
            'is_deleted'
        )
        result
    end

end
