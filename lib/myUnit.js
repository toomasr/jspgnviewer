function assertEquals(obj1, obj2) {
 if( obj1 !== obj2)
	 throw "assertEquals failed for '"+obj1+"' and '"+obj2+"'"
}

function TestSuite() {
 this.tests = new Array()

 this.addTest = function(fun) {
	 this.tests[this.tests.length] = fun
 }
 

 this.runTests = function() {
	 for (var i = 0;i < this.tests.length; i++) {
		 try {
			 this.tests[i]() 
			 var funName = (this.tests[i]+"").match(/function ([^)]*)\)/)
			 var res = funName[1].substr(0,funName[1].length-1)+" SUCCESS";
			 var el = document.getElementById('result')
			 el.appendChild(document.createTextNode(res))
			 el.innerHTML+="<br>"
		 }
		 catch (e) {
			 var funName = (this.tests[i]+"").match(/function ([^)]*)\)/)
			 var res = funName[1].substr(0,funName[1].length-1)+" '"+e.message+"' "+" FAILURE";
			 
			 var el = document.getElementById('result')
			 el.appendChild(document.createTextNode(res))
			 el.innerHTML+="<br>"
		 }
	 }
 }
}
