class AdminMetroMapBlockDefinition extends window.wagtailStreamField.blocks.StructBlockDefinition {

    render(placeholder, prefix, initialState, initialError) {
        const block = super.render(placeholder, prefix, initialState, initialError);

        // const stateField = document.getElementById(prefix + '-state');
        // const countryField = document.getElementById(prefix + '-country');
        // const updateStateInput = () => {
        //     if (countryField.value == 'us') {
        //         stateField.removeAttribute('disabled');
        //     } else {
        //         stateField.setAttribute('disabled', true);
        //     }
        // }
        // updateStateInput();
        // countryField.addEventListener('change', updateStateInput);

        return block;
    }
}
window.telepath.register('core.blocks.AdminMetroMapBlock', AdminMetroMapBlockDefinition);
