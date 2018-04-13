class MainController < ApplicationController
  def spaceinvaders
    @top_10=HighScore.limit(10).order(score: :desc).all
  end
    
  def high_score
    hs = HighScore.all.sort_by(&:score).last
    hs = hs || HighScore.new
    render json: {user: hs.user , score: hs.score }.to_json    
  end
  
  def post_score
    HighScore.create!(high_score_params)
    redirect_to "/"
    #render status: 200, json: {}.to_json
  end
  
  private
  def high_score_params
    params.require(:high_score).permit(:user, :score)
  end
end