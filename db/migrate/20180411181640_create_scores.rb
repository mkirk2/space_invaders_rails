class CreateScores < ActiveRecord::Migration[5.1]
  def change
    create_table :high_scores do |t|
      t.string :user
      t.integer :score
    end
  end
end
