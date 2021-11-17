
exports.getDate = (date=new Date())=>{
    const options = {
        weekday:'long',
        year: "numeric",
        day:'2-digit',
        month: 'long',
    }
    const day = date.toLocaleDateString("en-US", options);
    return day;
}

exports.getDay = ()=>{
    const today = new Date();
    const options = {
        weekday:'long'
    }
    const day = today.toLocaleDateString("en-US", options);
    return day;
}

exports.getDay = (date)=>{
    const options = {
        weekday:'long'
    }
    const day = date.toLocaleDateString("en-US", options);
    return day;
}
