/**
 * @Document(name="MyProject:User", collection="users", repository="../repository/user")
 * @Listener(listener="my.model.listener", events=["prePersist","postPersist"])
 */
function User(){};

User.prototype = {

	id: null,

	email: null,

	password: null,
	salt: null,

	version: 0,

	createdAt: null,
	updatedAt: null

};

module.exports = User;