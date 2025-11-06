class IdGenerator {
  /**
   * Generates a 6-digit numeric ID with a given prefix.
   * @param {string} [prefix="ID"] - The prefix for the generated ID.
   * @returns {string} A unique identifier (e.g., "P-431212").
   */
  static gen(prefix = "ID") {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${random}`;
  }
}

module.exports = IdGenerator;
