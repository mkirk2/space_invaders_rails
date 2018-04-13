class HighScore < ActiveRecord::Base
  validates :user, presence: true
  validates :score, presence: true
end
