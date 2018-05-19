class Dates {
  static formatDate(dateIn) {
    const date = new Date(dateIn);
    const year = date.getFullYear();
    let month = `${date.getMonth() + 1}`;
    let day = `${date.getDate()}`;

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;
    return [year, month, day].join('');
  }
}

module.exports = Dates;
