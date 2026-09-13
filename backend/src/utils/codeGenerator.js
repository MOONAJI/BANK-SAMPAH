/**
 * Generate formatted unique transaction code
 * @param {'DEP'|'WD'} prefix 
 * @returns {string} Example: DEP-20260913-9821
 */
const generateTransactionCode = (prefix) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomSuffix}`;
};

module.exports = {
  generateTransactionCode
};
