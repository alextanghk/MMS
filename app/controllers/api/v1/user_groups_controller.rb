class Api::V1::UserGroupsController < Api::V1::ApplicationController

    before_action :user_authorize_request

    def list
        raise SecurityTransgression unless @current_user.can_do?("GET_USER_GROUP")

        items = UserGroup.active
        query = params.permit(:page,:size,:order,:sort,:keywords,:status,:created_from,:created_to)
        page = query[:page].present? ? query[:page] : 1
        size = query[:size].present? ? query[:size] : 25
        if query[:keywords].present?
            items = items.where("name LIKE ? ","%#{query[:keywords]}%")
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
        raise SecurityTransgression unless @current_user.can_do?("GET_USER_GROUP")
        item_id = params[:item_id]
        item = UserGroup.active.find(item_id.to_i)
        
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
        form = params.permit(:name, :remark)
        access = params.permit(:access_rights)
        item = UserGroup.new(form)

        raise SecurityTransgression unless @current_user.can_create?(item)

        if !item.valid?
            render status:500, json: {
                message: "invalid",
                error: item.errors.messages,
                data: nil
            }
            return
        end
        if access[:access_rights].present?
            all_ids = access[:access_rights].split(",")
            all_ids = all_ids.map!{|e| e.to_i}
            access_rights = AccessRight.where(id: all_ids).order('id asc')
            all_found_ids = access_rights.collect(&:id)
            all_found_ids = all_found_ids.sort_by(&:to_i)
            all_ids = all_ids.sort_by(&:to_i)
            if (all_found_ids & all_ids) == all_ids
                item.access_rights = access_rights
            else
                render status:500, json: {
                    message: "invalid",
                    error: "access_right_not_found",
                    data: nil
                }
                return
            end
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
        item = UserGroup.active.find(item_id.to_i)
        raise SecurityTransgression unless @current_user.can_update?(item)
        form = params.permit(:name, :remark)
        access = params.permit(:access_rights)
        item.assign_attributes(form)

        if !item.valid?
            render status:500, json: {
                message: "invalid",
                error: item.errors.messages,
                data: nil
            }
            return
        end

        if access[:access_rights].present?
            all_ids = access[:access_rights].split(",")
            all_ids = all_ids.map!{|e| e.to_i}
            access_rights = AccessRight.where(id: all_ids).order('id asc')
            all_found_ids = access_rights.collect(&:id)
            all_found_ids = all_found_ids.sort_by(&:to_i)
            all_ids = all_ids.sort_by(&:to_i)
            if (all_found_ids & all_ids) == all_ids
                item.access_rights = access_rights
            else
                render status:500, json: {
                    message: "invalid",
                    error: "access_right_not_found",
                    data: nil
                }
                return
            end
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
        item = UserGroup.active.find(item_id.to_i)
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
        result[:access_rights] = item.access_rights.map{|row|
            row.attributes.except('is_deleted','is_display')
        }
        result
    end
end
