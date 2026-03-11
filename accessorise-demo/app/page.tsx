export default function AccessoriseItDemo() {
  const bikeOptions = [
    "BMW R1300GSA",
    "BMW R1250GS",
    "Yamaha Tenere 700",
    "KTM 890 Adventure",
  ];

  const installed = ["Crash bars", "Panniers", "Aux lights"];
  const recommended = ["Comfort seat", "Skid plate", "Luggage rack", "Tyres"];
  const categories = ["Protection", "Luggage", "Comfort", "Lighting", "Off-road", "Touring"];

  const accessories = [
    { name: "Outback Pannier System", category: "Luggage", price: "$1,290", fit: "Exact fit for BMW R1300GS / GSA", featured: true },
    { name: "Adventure Crash Bars", category: "Protection", price: "$890", fit: "Exact fit for BMW R1300GS / GSA" },
    { name: "Rally Skid Plate", category: "Off-road", price: "$640", fit: "Exact fit for BMW R1300GS / GSA" },
    { name: "Touring Comfort Seat", category: "Comfort", price: "$520", fit: "Exact fit for BMW R1300GS / GSA" },
  ];

  const communityBuilds = [
    {
      title: "Outback Touring Setup",
      tags: ["Long-range", "Luggage", "Protection"],
      desc: "Built for remote Australian touring with protection, storage, and comfort upgrades.",
      cost: "$3,850",
    },
    {
      title: "Weekend Gravel Explorer",
      tags: ["Tyres", "Lighting", "Lightweight"],
      desc: "A cleaner setup focused on confidence on gravel and short overnighters.",
      cost: "$1,940",
    },
    {
      title: "Alpine Adventure Build",
      tags: ["Screen", "Seat", "Luggage"],
      desc: "A cold-weather touring setup designed for comfort and all-day range.",
      cost: "$2,760",
    },
  ];

  const marketItems = [
    { title: "Outback Pannier System", price: "$1,290", cta: "Buy now" },
    { title: "Adventure Crash Bars", price: "$890", cta: "Find dealer" },
    { title: "Touring Comfort Seat", price: "$520", cta: "Save to build" },
  ];

  const selectedMods = [
    { label: "Panniers", active: true, impact: "+ touring" },
    { label: "Crash Bars", active: true, impact: "+ protection" },
    { label: "Aux Lights", active: true, impact: "+ visibility" },
    { label: "Skid Plate", active: false, impact: "+ off-road" },
    { label: "Comfort Seat", active: false, impact: "+ comfort" },
  ];

  const flowCards = [
    { step: "01", title: "Choose bike", text: "Select your exact model and year." },
    { step: "02", title: "Match parts", text: "Only see accessories that fit." },
    { step: "03", title: "Visualise build", text: "Preview the setup before buying." },
    { step: "04", title: "Buy or save", text: "Purchase, share, or copy a build." },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2ff_45%,_#e2e8f0_100%)] text-slate-900">
      <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-bold text-white shadow-lg">AI</div>
              <div>
                <div className="text-2xl font-bold tracking-tight">Accessorise It</div>
                <div className="text-sm text-slate-500">Investor demo · motorcycle customisation marketplace</div>
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            {['Problem', 'Product', 'Garage', 'Customiser', 'Community', 'Revenue'].map((item) => (
              <button key={item} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900">
                {item}
              </button>
            ))}
            <button className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20">
              Request pilot
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-8 md:p-10">
                <div className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
                  Investor-ready concept demo
                </div>
                <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                  The platform for building and buying your perfect bike setup.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                  Accessorise It helps riders choose their bike, discover exact-fit accessories, preview the final build, learn from other riders, and buy with confidence.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5">
                    Watch product tour
                  </button>
                  <button className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    View revenue model
                  </button>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Bike-first discovery', value: 'Exact-fit' },
                    { label: 'Visual planning', value: 'Before buying' },
                    { label: 'Monetisation', value: 'Affiliate + vendor' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</div>
                      <div className="mt-2 text-lg font-bold text-slate-900">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[420px] overflow-hidden bg-[linear-gradient(135deg,#0f172a,#1e293b,#3730a3)] p-6 text-white">
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="relative rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-indigo-200">Featured build</div>
                      <div className="mt-2 text-2xl font-bold">Paul's R1300GSA</div>
                    </div>
                    <div className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                      Live demo flow
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {flowCards.map((card) => (
                      <div key={card.step} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <div className="text-xs font-semibold tracking-[0.24em] text-indigo-200">STEP {card.step}</div>
                        <div className="mt-2 text-lg font-bold">{card.title}</div>
                        <div className="mt-1 text-sm text-slate-200">{card.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Why now</div>
              <h2 className="mt-3 text-2xl font-bold">Riders spend heavily, but discovery is still fragmented.</h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                <p>Today riders jump between forums, vendor sites, YouTube, Facebook groups, and dealer advice just to figure out what fits.</p>
                <p>Accessorise It brings bike identity, fitment certainty, visual configuration, community proof, and purchase into one product.</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/60 bg-slate-950 p-7 text-white shadow-[0_20px_60px_rgba(15,23,42,0.20)]">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Core wedge</div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  'BMW GS riders',
                  'Adventure touring',
                  'High accessory spend',
                  'Global enthusiast audience',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-slate-100">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              Screen 1 · choose your bike
            </div>
            <h3 className="mt-4 text-2xl font-bold">Bike selection</h3>
            <p className="mt-2 text-slate-500">Start with the rider’s exact machine to unlock fitment confidence.</p>

            <div className="mt-5 space-y-3">
              {bikeOptions.map((bike, index) => (
                <div key={bike} className={`flex items-center justify-between rounded-2xl border px-4 py-4 ${index === 0 ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-800'}`}>
                  <div>
                    <div className="font-semibold">{bike}</div>
                    <div className={`text-sm ${index === 0 ? 'text-slate-300' : 'text-slate-500'}`}>Adventure platform</div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${index === 0 ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-600'}`}>
                    {index === 0 ? 'Selected' : 'Choose'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              Screen 2 · my garage
            </div>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-2xl font-bold">Paul's Garage</h3>
                <p className="mt-1 text-slate-500">BMW R1300GSA · foundation profile</p>
              </div>
              <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Share garage</button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-700">Installed now</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {installed.map((item) => (
                    <span key={item} className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">{item}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-700">Suggested next</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recommended.map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              Screen 3 · explore accessories
            </div>
            <h3 className="mt-4 text-2xl font-bold">Filter by purpose</h3>
            <p className="mt-2 text-slate-500">Protection, luggage, comfort, lighting, touring and off-road, all narrowed to exact fit.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <button key={category} className={`rounded-full px-4 py-2 text-sm font-semibold ${index === 1 ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {accessories.map((item) => (
              <div key={item.name} className={`rounded-[28px] border p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] ${item.featured ? 'border-indigo-200 bg-gradient-to-br from-white to-indigo-50' : 'border-white/60 bg-white/85'}`}>
                <div className="flex items-center justify-between">
                  <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{item.category}</div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Fit confirmed</div>
                </div>
                <h4 className="mt-4 text-xl font-bold">{item.name}</h4>
                <p className="mt-2 text-sm text-slate-500">{item.fit}</p>
                <div className="mt-5 flex items-center justify-between">
                  <div className="text-lg font-bold">{item.price}</div>
                  <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Add to build</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              Screen 4 · visual customiser
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">Preview your build</h3>
                <p className="mt-2 text-slate-500">This investor version simulates layered visualisation and exact-fit confidence.</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Build total $2,180</div>
            </div>

            <div className="mt-6 rounded-[28px] bg-[linear-gradient(135deg,#0f172a,#1e1b4b,#312e81)] p-5 shadow-inner">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {selectedMods.map((item) => (
                    <div key={item.label} className={`rounded-2xl border px-4 py-4 ${item.active ? 'border-white/15 bg-white/12 text-white' : 'border-white/10 bg-black/10 text-slate-300'}`}>
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-300">{item.impact}</div>
                      <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.active ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-200'}`}>
                        {item.active ? 'Applied' : 'Optional'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Investor takeaway</div>
            <h3 className="mt-3 text-2xl font-bold">Why the customiser matters</h3>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>It shortens the path from inspiration to purchase.</p>
              <p>It increases buyer confidence because riders can see how the bike evolves before committing money.</p>
              <p>It creates a sticky profile users return to as they keep upgrading over time.</p>
            </div>
            <button className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Open monetisation notes</button>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              Screen 5 · community builds
            </div>
            <h3 className="mt-4 text-2xl font-bold">Builds riders can copy</h3>
            <div className="mt-5 space-y-4">
              {communityBuilds.map((build) => (
                <div key={build.title} className="rounded-[28px] border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-lg font-bold">{build.title}</div>
                      <div className="mt-1 text-sm text-slate-500">Estimated package value {build.cost}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {build.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{build.desc}</p>
                  <div className="mt-4 flex gap-3">
                    <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Copy build</button>
                    <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Save inspiration</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/85 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
            <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              Screen 6 · marketplace
            </div>
            <h3 className="mt-4 text-2xl font-bold">Revenue layer</h3>
            <p className="mt-2 text-slate-500">Affiliate income, vendor placements, dealer referrals, featured products, and premium build tools.</p>

            <div className="mt-5 space-y-4">
              {marketItems.map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-[28px] border border-slate-200 bg-white p-4">
                  <div>
                    <div className="font-bold">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-500">Fits BMW R1300GS / GSA</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{item.price}</div>
                    <button className="mt-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{item.cta}</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[28px] bg-slate-950 p-5 text-white">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Business model summary</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {['Affiliate commission', 'Vendor subscription', 'Featured listings', 'Premium rider plans'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
