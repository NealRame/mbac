'use strict';

/// String helpers
/// --------------
/// - author: Neal.Rame. <contact@nealrame.com>
/// -   date: Tue Jan 19 22:44:56 CET 2016
///
/// Provides common function to deal with string.

/// #### common.string.convertEOL(str, old_eol, new_eol)
/// Convert all end_of_line sequence in the given string.
///
/// **Parameters:**
/// - `str`, the `String` to be converted.
/// - `old_eol`, the current end_of_line character sequence.
/// - `new_eol`, the new end_of_line character sequence.
///
/// **Returns:**
/// - a `String`.
exports.convertEOL = function(s, old_eol, new_eol) {
    return s.replace(new RegExp(old_eol, 'g'), new_eol);
};
