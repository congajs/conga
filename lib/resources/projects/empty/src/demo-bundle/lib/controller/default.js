/**
 * @Route("/")
 */
function DefaultController(){};

DefaultController.prototype = {

	/**
	 * @Route("/", name="default.index", methods=["GET"])
	 * @Template
	 */
	index: function(req, res){
		res.return({ foo : 'bar', blah: [1,2,3] })
	}
};

module.exports = DefaultController;