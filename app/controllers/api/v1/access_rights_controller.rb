class Api::V1::AccessRightsController < Api::V1::ApplicationController
    before_action :user_authorize_request

    def list
        items = AccessRight.active.where(is_display: true).order(function: :asc, category: :asc, weight: :asc)
        items = items.order("function asc", "category asc","weight asc")
        render json: {
            message: "success",
            error: nil,
            data: items.reduce({}) {|result, row|
                if result[row[:function]].nil? 
                    result[row[:function]] = {}
                end
                if result[row[:function]][row[:category]].nil?
                    result[row[:function]][row[:category]] = []
                end
                result[row[:function]][row[:category]].push(row)
                result
            }
        }
    end

    def check
        query = params.permit(:code)
        if @current_user.user_group.access_rights.exists?(code: ["ALL_REQUEST",query[:code]])
            render json: {
                message: "success",
                error: nil,
                data: items
            }
            return 
        end

        render json: { message: "user_access_deined", error: "user_access_deined" }, status: :unauthorized
    end
end
