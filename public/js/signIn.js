class signIn {
	constructor() {
		this.xhr = this.getXhrType();

        this.check();
	}

	getXhrType() {

        let x;
    
        try {
            x = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                x = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                x = 0;
            }
        }
    
        if(!x && typeof XMLHttpRequest != 'undefined') x = new XMLHttpRequest();
    
        return x;
    }

    check() {

        const xhr = this.xhr;

        xhr.onload = xhr.onerror = function() {
            
            document.getElementsByClassName('media-progress')[0].style.width = "0px";
        
            if(xhr.status == 200) {
                    
                if(xhr.response == 1) {
                    window.location.href = "/list.html";
                }
            } else {
                document.getElementsByClassName('error-log')[0].innerHTML = "Request is not successful! Please, try again!";
            }
        }.bind(this);
        
        xhr.onprogress = function(event) {
            document.getElementsByClassName('media-progress')[0].style.width = Math.round((event.loaded * 100) / event.total) + "%";
        };
        
        xhr.open('GET', "https://courseworkgayduk.herokuapp.com/login_check", true);
        
        xhr.send();
    }

    sanitize(text) {
        return text.replace(/<script>|[\t\r\n]|(--[^\r\n]*)|(\/\*[\w\W]*?(?=\*)\*\/)/gim, "");
    }

    login() {

    	let phone = this.sanitize(document.getElementsByClassName("login-field")[0].value);
        let pass = this.sanitize(document.getElementsByClassName("pass-field")[0].value);
        
        if(phone.length > 0 && phone.length <= 40) { 
        	if(/^\d[\d\(\)\ -]{4,14}\d$/.test(phone)) {
                if(pass.length >= 8 && pass.length <= 40) {
    	            const xhr = this.xhr;
            
                    xhr.onload = xhr.onerror = function() {
                        
                        document.getElementsByClassName('media-progress')[0].style.width = "0px";
                    
                        if(xhr.status == 200) {
                                
                            if(xhr.response == 1) {
                                window.location.href = "/list.html";
                            } else {
                            	document.getElementsByClassName('error-log')[0].innerHTML = "No such user found! Please, try again!";
                            }
                        } else {
                            document.getElementsByClassName('error-log')[0].innerHTML = "Request is not successful! Please, try again!";
                        }
                    }.bind(this);
                    
                    xhr.onprogress = function(event) {
                        document.getElementsByClassName('media-progress')[0].style.width = Math.round((event.loaded * 100) / event.total) + "%";
                    };
                    
                    xhr.open('POST', "https://courseworkgayduk.herokuapp.com/login", true);

                    xhr.setRequestHeader("Content-Type", "application/json");

                    var obj = {
                    	phone: phone,
                    	pass: pass
                    };
        
                    xhr.send(JSON.stringify(obj));
                } else {
                	document.getElementsByClassName('registr-pass-field')[0].focus();
                    document.getElementsByClassName('error-log')[0].innerHTML = "Password length is incorrect! Please, try again!";
                }
            } else {
            	document.getElementsByClassName('login-field')[0].focus();
                document.getElementsByClassName('error-log')[0].innerHTML = "Phone format is incorrect! Please, try again!";
            }
        } else {
        	document.getElementsByClassName('login-field')[0].focus();
            document.getElementsByClassName('error-log')[0].innerHTML = "Phone length is incorrect! Please, try again!";
        }
    }
}

signIn = new signIn();
