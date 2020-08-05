const { contract, is } = require("contractis");
const Field = require("./field");

class RadioGroup {
  constructor(o) {
    this.label = o.label;
    this.name = o.name;
    this.groups = o.groups;
    this.isRadioGroup = true;
    contract.class(this);
  }

  validate(whole_rec) {
    const groupName = whole_rec[this.name];
    if (!groupName) return { error: { [this.name]: "Missing value" } };

    const group = this.groups.find(g => g.value === groupName);
    if (!group) return { error: { [this.name]: "Value not recognized" } };
    var res = { [this.name]: group.value };
    var errors = {};
    group.fields.forEach(f => {
      const fval = f.validate(whole_rec);
      if (fval.success) res[f.name] = fval.success;
      else if (fval.error) errors[f.name] = fval.error;
    });
    if (Object.keys(errors).length === 0) return { success: res };
    else return { error: errors };
  }
}

RadioGroup.contract = {
  variables: {
    name: is.str,
    label: is.maybe(is.str),
    groups: is.array(
      is.obj({
        value: is.str,
        label: is.str,
        fields: is.array(is.class("Field"))
      })
    ),
    isRadioGroup: is.eq(true)
  },
  methods: {
    validate: is.fun(
      is.obj(),
      is.or(is.obj({ errors: is.obj() }), is.obj({ success: is.obj() }))
    )
  }
};
module.exports = RadioGroup;
