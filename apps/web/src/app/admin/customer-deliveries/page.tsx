export default function CustomerDeliveries() {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">Customer Deliveries</h2>
      <ul className="list-disc list-inside text-sm text-gray-300">
        <li>Order fulfillment status</li>
        <li>Estimated delivery (AI-based ETA)</li>
        <li>Delay analysis</li>
        <li>Customer-wise fulfillment %</li>
      </ul>
    </section>
  );
}
