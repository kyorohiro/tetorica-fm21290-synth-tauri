// SPDX-License-Identifier: BSD-3-Clause
(async () => {
  const invoke = window.__TAURI_INTERNALS__.invoke;
  const timeout = setTimeout(() => invoke('smoke_result', {error: 'WebView initialization or rendering timed out'}), 30000);
  try {
    while (document.querySelector('main')?.inert) await new Promise(resolve => setTimeout(resolve, 50));
    if (!document.querySelector('[data-file-path="/examples/scheduled-echo.js"]'))
      throw Error('Default scheduled performance is missing from Files');
    const {createNativeFXRack} = await import('../js/native_fx_rack.js');
    const {createInstrument} = await import('./instrument.js');
    const {voiceToPreset, presetToVoice} = await import('../js/msfa_dx7/src/preset.js');
    async function render(gain) {
      const context = new AudioContext();
      await context.audioWorklet.addModule('./worklet.js');
      const synth = new AudioWorkletNode(context, 'tetorica-fm21290', {numberOfInputs:0,outputChannelCount:[1]});
      const rack = await createNativeFXRack(context);
      rack.controller.liveFx('level', {context:{gain}, process(input,output,state,params) {
        for(let ch=0;ch<input.length;ch++)
          for(let i=0;i<input[ch].length;i++) output[ch][i]=input[ch][i]*params.gain;
      }});
      let fxError;
      rack.onError = message => { fxError = message; };
      const dry = context.createAnalyser();
      const meter = context.createAnalyser();
      const mute = context.createGain();
      mute.gain.value = 0;
      synth.connect(dry).connect(rack.node).connect(meter).connect(mute).connect(context.destination);
      await context.resume();
      const writes = [];
      const chip = createInstrument((address,value)=>writes.push([address,value]));
      chip.setPatch(voiceToPreset(presetToVoice({algorithm:0,operators:{1:{outputLevel:95,envelope:{rates:[99,99,99,99],levels:[99,99,99,0]}}}})));
      chip.keyOn(0,60,100);
      synth.port.postMessage({writes});
      const samples = new Float32Array(meter.fftSize);
      let peak = 0, dryPeak = 0;
      await new Promise(resolve => setTimeout(resolve, 300));
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 15));
        dry.getFloatTimeDomainData(samples);
        for (const sample of samples) dryPeak = Math.max(dryPeak, Math.abs(sample));
        meter.getFloatTimeDomainData(samples);
        for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
      }
      rack.dispose();
      await context.close();
      if (fxError) throw Error(fxError);
      if (!(dryPeak > 0.001)) throw Error('Silent FM worklet');
      return peak / dryPeak;
    }
    const full = await render(1), quiet = await render(0.5);
    if (!(Math.abs(full - 1) < 0.05 && Math.abs(quiet - 0.5) < 0.05))
      throw Error('Unexpected wet/dry gains: ' + full + ', ' + quiet);
    await invoke('smoke_result', {error:null});
  } catch (error) {
    await invoke('smoke_result', {error:String(error)});
  } finally { clearTimeout(timeout); }
})();
