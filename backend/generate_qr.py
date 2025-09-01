import qrcode

def generate_qr(table_id):
    url = f"http://localhost:3000/menu?tableId={table_id}"
    img = qrcode.make(url)
    img.save(f"qr-{table_id}.png")
    print(f"QR for {table_id} saved as qr-{table_id}.png")

for t in ["T1", "T2", "T3"]:
    generate_qr(t)
