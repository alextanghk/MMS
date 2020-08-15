class Api::V1::UsersController < Api::V1::ApplicationController
    before_action :user_authorize_request, :set_paper_trail_whodunnit

    def list
        raise SecurityTransgression unless @current_user.can_do?("GET_USER")

        items = User.active
        query = params.permit(:page,:size,:order,:sort,:keywords,:status,:created_from,:created_to)
        page = query[:page].present? ? query[:page] : 1
        size = query[:size].present? ? query[:size] : 25
        if query[:keywords].present?
            items = items.where("zh_name ILIKE ? OR en_name ILIKE ? OR email ILIKE ? OR user_name ILIKE ? ","%#{query[:keywords]}%","%#{query[:keywords]}%","%#{query[:keywords]}%","%#{query[:keywords]}%")
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
    rescue SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def profile
        
        item = ReturnFormat(@current_user)
        
        render json: {
            message: "success",
            error: nil,
            data: item
        }
    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def get
        raise SecurityTransgression unless @current_user.can_do?("GET_USER")
        item_id = params[:item_id]
        item = User.active.find(item_id.to_i)
        
        render json: {
            message: "success",
            error: nil,
            data: ReturnFormat(item)
        }
    rescue ActiveRecord::RecordNotFound => e
        render json: { message: "data_not_found", error: "data_not_found" }, status: :not_found
    rescue SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def create
        form = params.permit(:zh_name,:en_name,:user_name,:email,:mobile,:user_group_id,:password,:password_confirmation, :is_actived)

        item = User.new(form)
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
    rescue SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def update
        id = params[:item_id]
        item = User.active.find(id.to_i)
        raise SecurityTransgression unless @current_user.can_update?(item)

        form = params.permit(:zh_name,:en_name,:email,:mobile,:user_group_id,:password,:password_confirmation, :is_actived)
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
    rescue SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def update_profile
        item = @current_user

        form = params.permit(:zh_name,:en_name,:email,:mobile,:password,:password_confirmation)
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
    rescue SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def delete
        item_id = params[:item_id]

        if item_id.to_i == 1
            render json: { message: "delete_super_admin", error: "Super Admin cannot be delete" }, status: :unauthorized
            return
        end
        item = User.active.find(item_id.to_i)
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
    rescue SecurityTransgression => e
        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :forbidden
    rescue => e
        render json: { message: "system_error", error: e.message }, status: :internal_server_error
    end

    def ReturnFormat(item)
        
        result = item.attributes.except('is_deleted','password_digest')
        result[:user_group] = item.user_group.attributes.except('is_deleted')
        result
    end

end
