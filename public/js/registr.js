class Registr {
	constructor() {

    	this.xhr = this.getXhrType();

        this.check();

        this.phone = 0;

        this.timeinterval = 0;
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

    registrCode() {

    	document.getElementsByClassName('error-log')[0].innerHTML = "";

        if(document.getElementsByClassName("login-field")[0] != undefined) this.phone = this.sanitize(document.getElementsByClassName("login-field")[0].value);

        if(this.phone.length > 0 && this.phone.length <= 40) { 
        	if(/^\d[\d\(\)\ -]{4,14}\d$/.test(this.phone)) {

    	        const xhr = this.xhr;
                
                xhr.onload = xhr.onerror = function() {
            
                	document.getElementsByClassName('media-progress')[0].style.width = "0px";
            
                    if(xhr.status == 200) {
                            
                        if(xhr.response != 0) {

                            document.getElementsByClassName("recover-btn")[0].value = "Подтвердить";
                            document.getElementsByClassName('recover-btn')[0].setAttribute('onclick','registr.codeCheck()');

                            if(document.getElementsByClassName("code-field")[0] == undefined) {

                                document.getElementsByClassName('main-form')[0].removeChild(document.getElementsByClassName('login-text')[0]);
                                document.getElementsByClassName('main-form')[0].removeChild(document.getElementsByClassName('login-field')[0]);

                                document.getElementsByClassName('recover-btn')[0].setAttribute('onclick','registr.codeCheck()');
                                
                                let elem1 = document.createElement('label');
                                elem1.className = 'code-label';
                                elem1.innerHTML = "Отправленный код <span class='code-timer'></span>";
                                
                                document.getElementsByClassName("main-form")[0].appendChild(elem1);
    
                                let elem2 = document.createElement('input');
                                elem2.className = "code-field";
                                elem2.type = 'text';
    
                                document.getElementsByClassName("main-form")[0].appendChild(elem2);
                                document.getElementsByClassName("recover-btn")[0].value = "Подтвердить";
                            }

                            var count = 0;
                            var val = 4;

                            this.timeinterval = setInterval(function(){
                                count++;
                                if((240 - count)%60 == 0) val--;
                                document.getElementsByClassName('code-timer')[0].innerHTML = val + "." + (300 - count)%60 + "с:";
                                if(count == 300) {
                                    document.getElementsByClassName('code-timer')[0].innerHTML = ":";
                                    document.getElementsByClassName("recover-btn")[0].value = "Выслать код повторно";
                                    document.getElementsByClassName('recover-btn')[0].setAttribute('onclick','registr.registrCode()');
                                    clearInterval(this.timeinterval);
                                }
                            }.bind(this),1000);

                        } else {
                        	document.getElementsByClassName('error-log')[0].innerHTML = "This login is already taken!";
                        }
                    } else {
                        document.getElementsByClassName('error-log')[0].innerHTML = "Request is not successful! Please, try again!";
                    }
                }.bind(this);
                
                xhr.onprogress = function(event) {
                	document.getElementsByClassName('media-progress')[0].style.width = Math.round((event.loaded * 100) / event.total) + "%";
                };
                
                xhr.open('POST', "https://courseworkgayduk.herokuapp.com/registration_code", true);

                xhr.setRequestHeader("Content-Type", "application/json");

                var obj = {
                	phone: this.phone,
                };
        
                xhr.send(JSON.stringify(obj));
            } else {
            	document.getElementsByClassName('login-field')[0].focus();
                document.getElementsByClassName('error-log')[0].innerHTML = "Phone format is incorrect! Please, try again!";
            }
        } else {
            document.getElementsByClassName('login-field')[0].focus();
            document.getElementsByClassName('error-log')[0].innerHTML = "Phone length is incorrect! Please, try again!";
        }
    }

    codeCheck() {

        document.getElementsByClassName('error-log')[0].innerHTML = "";

        if(document.getElementsByClassName('code-field')[0] != undefined) {

            var code = this.sanitize(document.getElementsByClassName('code-field')[0].value);

            if(code.length > 0 && code.length == 5) {

                const xhr = this.xhr;
                
                xhr.onload = xhr.onerror = function() {
            
                    document.getElementsByClassName('media-progress')[0].style.width = "0px";
            
                    if(xhr.status == 200) {
                        if(xhr.responseText == '1') {
                            clearInterval(this.timeinterval);

                            document.getElementsByClassName('recover-btn')[0].setAttribute('onclick','registr.registr()');
    
                            document.getElementsByClassName('main-form')[0].removeChild(document.getElementsByClassName('code-label')[0]);
                            document.getElementsByClassName('main-form')[0].removeChild(document.getElementsByClassName('code-field')[0]);
                            
                            document.getElementsByClassName("recover-container")[0].style.height = "350px";
                            document.getElementsByClassName("recover-btn")[0].style.marginTop = "280px";
                            document.getElementsByClassName("recover-index")[0].style.marginTop = "325px";
    
                            let elem1 = document.createElement('label');
                            elem1.className = "registr-pass-text";
                            elem1.innerHTML = "Придумайте пароль (8-40): "
    
                            document.getElementsByClassName('main-form')[0].appendChild(elem1);
                            
                            let elem2 = document.createElement('input');
                            elem2.className = "registr-pass-field";
                            elem2.type = 'password';
    
                            document.getElementsByClassName('main-form')[0].appendChild(elem2);
    
                            let elem3 = document.createElement('label');
                            elem3.className = "alias-text";
                            elem3.innerHTML = "Придумайте никнейм (0-12): "
    
                            document.getElementsByClassName('main-form')[0].appendChild(elem3);
    
                            let elem4 = document.createElement('input');
                            elem4.className = "alias-field";
                            
                            document.getElementsByClassName('main-form')[0].appendChild(elem4);
                        } else {
                            document.getElementsByClassName('error-log')[0].innerHTML = "Code is not valid! Please, try again!";
                        }
                    } else {
                        document.getElementsByClassName('error-log')[0].innerHTML = "Request is not successful! Please, try again!";
                    }
                }.bind(this);
                
                xhr.onprogress = function(event) {
                    document.getElementsByClassName('media-progress')[0].style.width = Math.round((event.loaded * 100) / event.total) + "%";
                };
                
                xhr.open('POST', "https://courseworkgayduk.herokuapp.com/code_check", true);

                xhr.setRequestHeader("Content-Type", "application/json");

                var obj = {
                    checkCode: code,
                };
        
                xhr.send(JSON.stringify(obj));
            } else {
                document.getElementsByClassName('code-field')[0].focus();
                document.getElementsByClassName('error-log')[0].innerHTML = "Code length is incorrect! Please, try again!";
            }
        }
    }

    registr() {

    	document.getElementsByClassName('error-log')[0].innerHTML = "";

    	let phone = this.sanitize(this.phone);
        let pass = this.sanitize(document.getElementsByClassName("registr-pass-field")[0].value);
        let alias = this.sanitize(document.getElementsByClassName("alias-field")[0].value);

        if(phone.length > 0 && phone.length <= 40) { 
        	if(/^\d[\d\(\)\ -]{4,14}\d$/.test(phone)) {
                if(pass.length >= 8 && pass.length <= 40) {
                    if(alias.length > 0 && alias.length <= 12) {   

    	                const xhr = this.xhr;
                
                        xhr.onload = xhr.onerror = function() {
            
                        	document.getElementsByClassName('media-progress')[0].style.width = "0px";
            
                            if(xhr.status == 200) {
                                    
                                if(xhr.response != 0) {
                                	window.location.href = "/list.html";
                                } else {
                                	document.getElementsByClassName('error-log')[0].innerHTML = "Something went wrong...";
                                }
                            } else {
                                document.getElementsByClassName('error-log')[0].innerHTML = "Request is not successful! Please, try again!";
                            }
                        }.bind(this);
                
                        xhr.onprogress = function(event) {
                        	document.getElementsByClassName('media-progress')[0].style.width = Math.round((event.loaded * 100) / event.total) + "%";
                        };
                  
                        xhr.open('POST', "https://courseworkgayduk.herokuapp.com/registration", true);

                        xhr.setRequestHeader("Content-Type", "application/json");

                        var obj = {
                        	phone: phone,
                        	pass: pass,
                        	alias: alias
                        };
        
                        xhr.send(JSON.stringify(obj));
                    } else {
                        document.getElementsByClassName('alias-field')[0].focus();
                        document.getElementsByClassName('error-log')[0].innerHTML = "Alias length is incorrect! Please, try again!";
                    }
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

registr = new Registr();