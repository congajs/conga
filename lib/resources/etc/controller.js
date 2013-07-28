/**{% if isRest %}
 * @Rest:Controller(adapter="conga-bass:rest/adapter", model="{{ model }}", documentManager="mongodb.default"){% endif %}
 * @Route("/{{ controllerRoute }}")
 */
function {{ controllerName }}(){}

{{ controllerName }}.prototype = {
	{% if not isRest %}
	/**
	 * @Route("/")
	 */
	index: function(req, res){
		res.return({
			message : 'Hello from {{ controllerName }}!!!' 
		});
	}
	{% endif %}
};

module.exports = {{ controllerName }};