const carbonFiberStyle = {
  backgroundColor: '#0c0c10',
  backgroundImage: [
    'linear-gradient(27deg, #15151a 5px, transparent 5px)',
    'linear-gradient(207deg, #15151a 5px, transparent 5px)',
    'linear-gradient(27deg, #1c1c22 5px, transparent 5px)',
    'linear-gradient(207deg, #1c1c22 5px, transparent 5px)',
    'linear-gradient(90deg, #0a0a0d 10px, transparent 10px)',
    'linear-gradient(transparent 3px, #18181e 3px, #18181e 4px, transparent 4px)',
  ].join(','),
  backgroundSize: '20px 20px, 20px 20px, 20px 20px, 20px 20px, 20px 20px, 20px 20px',
}

function BackgroundGlow() {
  return (
    <div className="fixed inset-0 -z-10" style={carbonFiberStyle}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
    </div>
  )
}

export default BackgroundGlow
