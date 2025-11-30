module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "API transaksi jalan (POST required)" });
  }

  return res.status(200).json({ message: "POST berhasil diterima" });
};
