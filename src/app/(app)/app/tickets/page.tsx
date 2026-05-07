// TODO: fetch tickets for current user from Supabase
export default function MyTicketsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">My Tickets</h1>
      <div className="text-muted-foreground text-sm">
        {/* TODO: render ticket list from Supabase */}
        No tickets yet.{" "}
        <a href="/app/new" className="text-foreground underline">
          Submit a request
        </a>
      </div>
    </div>
  );
}
