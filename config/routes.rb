Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'main#spaceinvaders'
  get 'high_score' => 'main#high_score'
  post 'high_score' => 'main#post_score'
end
