function getUserIdMinRange(){
	return 1;
}

function getUserIdMaxRange(){
	return 1000000;
}

function getJobIdMinRange(){
	return 1;
}

function getJobIdMaxRange(){
	return 1000000;
}

function generateRandomUserId(){
	return chance.integer({min: getUserIdMinRange(), max: getUserIdMaxRange()});
}

function generateRandomJobId(){
	return chance.integer({min: getJobIdMinRange(), max: getJobIdMaxRange()});
}

function generateRandomArray(length, minValue, maxValue){
	arrays = []; // For printing to console later
    for (var i = 0; i < length; i++){
      arrays.push(chance.integer({min: minValue, max: maxValue}));
    }
    return arrays;
}
