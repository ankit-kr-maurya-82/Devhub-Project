import Icon from './Icon'

const accents = {
  violet: 'from-violet-500/20 via-violet-500/5 to-[#121317] text-violet-300',
  emerald: 'from-emerald-500/20 via-emerald-500/5 to-[#121317] text-emerald-300',
  amber: 'from-amber-500/20 via-amber-500/5 to-[#121317] text-amber-300',
}

export default function BlogCover({ category = 'YOUR NEXT IDEA', icon = 'code', accent = 'violet', large = false }) {
  return (
    <div role="img" aria-label={`${category} cover placeholder`} className={`relative flex overflow-hidden border-b border-white/5 bg-gradient-to-br ${accents[accent] || accents.violet} ${large ? 'h-48 rounded-xl border border-white/10 sm:h-64' : 'h-40'}`}>
      <div aria-hidden="true" className="absolute -right-3 -top-5 size-44 rounded-full border-[24px] border-current opacity-5" />
      <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center"><Icon name={icon} className={large ? 'size-20 opacity-40' : 'size-14 opacity-40'} /></div>
      <div aria-hidden="true" className="relative mt-auto flex w-full items-end justify-between gap-3 p-5 font-mono text-[10px] tracking-widest">
        <span>{category}</span><span className="text-right text-zinc-400">DEVHUB / COVER</span>
      </div>
    </div>
  )
}
