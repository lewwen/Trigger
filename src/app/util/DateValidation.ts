function validateDateComponents(day: number, month: number, year: number) {
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
}

export function isValidDate(date: string): boolean {
    if(!/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(date)) {
        return false;
    }
    
    var parts = date.split("/");
    
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);
    
    return validateDateComponents(day, month, year);
};