class CreateScores < ActiveRecord::Migration[5.1]
  def change
    create_table :score_data do |t|
      t.string :username
      t.integer :final_score
    end
  end
end
