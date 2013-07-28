/**
 * @Bass:Document(name="{{ modelName }}", collection="{{ collectionName }}")
 */
function {{ modelName }}(){};

{{ modelName }}.prototype = {
{% for field in fields %}
	/**{% if field.property == 'id' %}
	 * @Bass:Id{% endif %}
	 * @Bass:Field(type="{{ field.type }}"{% if field.property == 'id' %}, name="_id"{% endif %})
	 */
	{{ field.property }}: null{% if not loop.last %},{% endif %}

{% endfor %}

};

module.exports = {{ modelName }};