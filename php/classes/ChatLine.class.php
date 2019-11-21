<?php

/* рядок чату */

class ChatLine extends ChatBase{
	
	protected $text = '', $author = '', $gravatar = '';
	
	public function save(){
		DB::query("
			INSERT INTO webchat_lines (author, gravatar, text)
			VALUES (
				'".DB::esc($this->author)."',
				'".DB::esc($this->gravatar)."',
				'".DB::esc($this->text)."'
		)");
		
		// Повертаємо об'єкт MySQLi класу DB
		
		return DB::getMySQLiObject();
	}
}

?>