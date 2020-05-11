$(function () {
    $(".select2").select2({
        allowClear: true,
        placeholder: 'Select Subjects...',
        closeOnSelect: false,
        width: '100%'
    });

    $(".select2").on('select2:unselecting', function (e) {
        $(".select2").on('select2:opening', function (e) {
            e.preventDefault();
            $(".select2").off('select2:opening');
        });
    });
});

$(document).ready(function () {
    if ($("#tempSubjects").val().length > 0) {
        $("#subjectSelect").val($("#tempSubjects").val().split(","));
        $('.select2').trigger('change');
    }
});