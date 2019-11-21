<?php

// Базовый класс, который используется классами ChatLine и ChatUser 

class ChatBase{

	// Даний конструктор використовується всіма класу чату:

	public function __construct(array $options){
		
		foreach($options as $k=>$v){
			if(isset($this->$k)){
				$this->$k = $v;
			}
		}
	}
}

?>