; 10 SYS3072

*=$801

        BYTE    $0B, $08, $0A, $00, $9E, $33, $30, $37, $32, $00, $00, $00

zpbase          = $fc
mt_temp1        = zpbase+0
mt_temp2        = zpbase+1


*= $0c00
        lda #$03
        sta $d020       ; border color

        sei
        lda #<irq
        ldx #>irq
        sta $314
        stx $315
        lda #$1b
        ldx #$00
        ldy #$7f 
        sta $d011
        stx $d012 
        sty $dc0d
        lda #$01
        sta $d01a
        sta $d019 ; ACK any raster IRQs
        lda #$00
        jsr $1000 ;Initialize Richard's music
        cli
hold    jmp hold ;We don't want to do anything else here. :)
 
irq
       lda #$01
       sta $d019 ; ACK any raster IRQs

       lda #$09
       sta $d020       ; border color

       jsr $1003 ;Play the music

       lda #$0a
       sta $d020       ; border color

       jmp $ea31

;-------------------------------------------------------------------------------
; GoatTracker V2.73 playroutine
;
; NOTE: This playroutine source code does not fall under the GPL license!
; Use it, or song binaries created from it freely for any purpose, commercial
; or noncommercial.
;
; NOTE 2: This code is in the format of Magnus Lind's assembler from Exomizer.
; Does not directly compile on DASM etc.
;-------------------------------------------------------------------------------

        ;Defines will be inserted by the relocator here

mt_temp1        = zpbase+0
mt_temp2        = zpbase+1

        ;Defines for the music data
        ;Patterndata notes

FIRSTNOTE       = $60
FIRSTNOTEMINUSONE = $5f
FIRSTNOHRINSTR  = $0C             ;  insertdefine("FIRSTNOHRINSTR", numnormal + 1);   first no hard restart instrument
SRPARAM         = 0
ADPARAM         = $0f
FIRSTLEGATOINSTR = $0C            ; this is cal based on instruments
                                   ;   insertdefine("FIRSTLEGATOINSTR", numnormal + numnohr + 1);

SIDBASE         = $D400
DEFAULTTEMPO    = $05
        ;Defines for the music data
        ;Patterndata notes


ENDPATT         = $00
INS             = $00
FX              = $40
FXONLY          = $50
NOTE            = $60
REST            = $bd
KEYOFF          = $be
KEYON           = $bf
FIRSTPACKEDREST = $c0
PACKEDREST      = $00

        ;Effects

DONOTHING       = $00
PORTAUP         = $01
PORTADOWN       = $02
TONEPORTA       = $03
VIBRATO         = $04
SETAD           = $05
SETSR           = $06
SETWAVE         = $07
SETWAVEPTR      = $08
SETPULSEPTR     = $09
SETFILTPTR      = $0a
SETFILTCTRL     = $0b
SETFILTCUTOFF   = $0c
SETMASTERVOL    = $0d
SETFUNKTEMPO    = $0e
SETTEMPO        = $0f

        ;Orderlist commands

REPEAT          = $d0
TRANSDOWN       = $e0
TRANS           = $f0
TRANSUP         = $f0
LOOPSONG        = $ff

        ;Wave,pulse,filttable comands

LOOPWAVE        = $ff
LOOPPULSE       = $ff
LOOPFILT        = $ff
SETPULSE        = $80
SETFILTER       = $80
SETCUTOFF       = $00

;                .ORG (base)
*= $1000

        ;Jump table

                jmp mt_init
                jmp mt_play
                jmp mt_setmastervol

        ;Author info


        ;0 Instrument vibrato

mt_tick0_0
                lda mt_insvibparam-1,y
                jmp mt_tick0_34

        ;1,2 Portamentos


mt_tick0_12
                tay
                lda #$00
                sta mt_chnvibtime,x
                tya

        ;3,4 Toneportamento, Vibrato

mt_tick0_34
                sta mt_chnparam,x
                lda mt_chnnewfx,x
                sta mt_chnfx,x
                rts

        ;5 Set AD

mt_tick0_5
                sta ghostad,x
                rts

        ;6 Set Sustain/Release

mt_tick0_6
                sta ghostsr,x
                rts

        ;7 Set waveform

mt_tick0_7
                sta mt_chnwave,x
                rts

        ;8 Set wavepointer

mt_tick0_8
                sta mt_chnwaveptr,x
                lda #$00                        ;Make sure possible delayed
                sta mt_chnwavetime,x            ;waveform execution goes
                            ;correctly
                rts

        ;9 Set pulsepointer

mt_tick0_9
                sta mt_chnpulseptr,x
                lda #$00                        ;Reset pulse step duration
                sta mt_chnpulsetime,x
                rts

        ;a Set filtpointer

mt_tick0_a
                ldy #$00
                sty mt_filttime+1
mt_tick0_a_step
                sta mt_filtstep+1
                rts

        ;b Set filtcontrol (channels & resonance)

mt_tick0_b
                sta mt_filtctrl+1
                beq mt_tick0_a_step          ;If 0, stop also step-programming
                rts

        ;c Set cutoff

mt_tick0_c
                sta mt_filtcutoff+1
                rts

        ;d Set mastervolume / timing mark

mt_tick0_d
mt_setmastervol
                sta mt_masterfader+1
                rts

        ;e Funktempo

mt_tick0_e
                tay
                lda mt_speedlefttbl-1,y
                sta mt_funktempotbl
                lda mt_speedrighttbl-1,y
                sta mt_funktempotbl+1
                lda #$00
                beq mt_tick0_f_setglobaltempo

        ;f Set Tempo

mt_tick0_f
                bmi mt_tick0_f_setchantempo     ;Channel or global tempo?
mt_tick0_f_setglobaltempo
                sta mt_chntempo
                sta mt_chntempo+7
                sta mt_chntempo+14
                rts
mt_tick0_f_setchantempo
                and #$7f
                sta mt_chntempo,x
                rts

        ;Continuous effect code

        ;0 Instrument vibrato

mt_effect_0_delay
                dec mt_chnvibdelay,x
mt_effect_0_donothing
                jmp mt_done
mt_effect_0
    beq mt_effect_0_donothing         ;Speed 0 = no vibrato at all
                lda mt_chnvibdelay,x
                bne mt_effect_0_delay

        ;4 Vibrato

mt_effect_4
                lda mt_speedlefttbl-1,y
                bmi mt_effect_4_nohibyteclear
                ldy #$00                        ;Clear speed highbyte
                sty mt_temp2
mt_effect_4_nohibyteclear
                and #$7f
                sta mt_effect_4_speedcmp+1
                lda mt_chnvibtime,x
                bmi mt_effect_4_nodir
mt_effect_4_speedcmp
                cmp #$00
                bcc mt_effect_4_nodir2
                beq mt_effect_4_nodir
                eor #$ff
mt_effect_4_nodir
                clc
mt_effect_4_nodir2
                adc #$02
mt_vibdone
                sta mt_chnvibtime,x
                lsr
                bcc mt_freqadd
                bcs mt_freqsub

        ;1,2,3 Portamentos

mt_effect_3
                tya
                beq mt_effect_3_found           ;Speed $00 = tie note
mt_effect_12

mt_effectnum
                lda #$00
                cmp #$02
                bcc mt_freqadd
                beq mt_freqsub
                ldy mt_chnnote,x
                lda ghostfreqlo,x              ;Calculate offset to the
                sbc mt_freqtbllo-FIRSTNOTE,y    ;right frequency
                pha
                lda ghostfreqhi,x
                sbc mt_freqtblhi-FIRSTNOTE,y
                tay
                pla
                bcs mt_effect_3_down            ;If positive, have to go down

mt_effect_3_up
                adc mt_temp1                   ;Add speed to offset
                tya                             ;If changes sign, we're done
                adc mt_temp2
                bpl mt_effect_3_found


mt_freqadd
                lda ghostfreqlo,x
                adc mt_temp1
                sta ghostfreqlo,x
                lda ghostfreqhi,x
                adc mt_temp2
                jmp mt_storefreqhi

mt_effect_3_down
                sbc mt_temp1                   ;Subtract speed from offset
                tya                             ;If changes sign, we're done
                sbc mt_temp2
                bmi mt_effect_3_found

mt_freqsub
                lda ghostfreqlo,x
                sbc mt_temp1
                sta ghostfreqlo,x
                lda ghostfreqhi,x
                sbc mt_temp2
                jmp mt_storefreqhi

mt_effect_3_found
                lda mt_chnnote,x
                jmp mt_wavenoteabs

        ;Init routine

mt_init
                sta mt_initsongnum+1
                rts

        ;Play soundeffect -routine


        ;Set mastervolume -routine


        ;Playroutine

mt_play
                ldx #24                         ;In full ghosting mode copy
mt_copyregs
    lda ghostregs,x                 ;previous frame's SID values in one step
                sta SIDBASE,x
                dex
                bpl mt_copyregs

                ldx #$00                        ;Channel index

        ;Song initialization

mt_initsongnum
                ldy #$00
                bmi mt_filtstep
                txa
                ldx #$29 ; #NUMCHANNELS * 14 - 1
mt_resetloop
                sta mt_chnsongptr,x             ;Reset sequencer + voice
                dex                             ;variables on all channels
                bpl mt_resetloop
                sta ghostfiltcutlow
                sta mt_filtctrl+1             ;Switch filter off & reset
                sta mt_filtstep+1             ;step-programming
                stx mt_initsongnum+1          ;Reset initflag
                tax
                jsr mt_initchn
                ldx #$07
                jsr mt_initchn
                ldx #$0e
mt_initchn
mt_defaulttempo
                lda #DEFAULTTEMPO               ;Set default tempo
                sta mt_chntempo,x
                lda #$01
                sta mt_chncounter,x             ;Reset counter
                sta mt_chninstr,x               ;Reset instrument
                jmp mt_loadregswaveonly          ;Load waveform

        ;Filter execution

mt_filtstep
                ldy #$00                        ;See if filter stopped
                beq mt_filtdone
mt_filttime
                lda #$00                        ;See if time left for mod.
                bne mt_filtmod                  ;step
mt_newfiltstep
                lda mt_filttimetbl-1,y          ;$80-> = set filt parameters
                beq mt_setcutoff                ;$00 = set cutoff
                bpl mt_newfiltmod
mt_setfilt
                asl                             ;Set passband
                sta mt_filttype+1
                lda mt_filtspdtbl-1,y           ;Set resonance/channel
                sta mt_filtctrl+1
                lda mt_filttimetbl,y            ;Check for cutoff setting
                bne mt_nextfiltstep2            ;following immediately
mt_setcutoff2
                iny
mt_setcutoff
                lda mt_filtspdtbl-1,y           ;Take cutoff value
                sta mt_filtcutoff+1
                jmp mt_nextfiltstep
mt_newfiltmod
                sta mt_filttime+1               ;$01-$7f = new modulation step
mt_filtmod
                lda mt_filtspdtbl-1,y           ;Take filt speed
                clc
                adc mt_filtcutoff+1
                sta mt_filtcutoff+1
                dec mt_filttime+1
                bne mt_storecutoff
mt_nextfiltstep
                lda mt_filttimetbl,y           ;Jump in filttable?
mt_nextfiltstep2
                cmp #LOOPFILT
                iny
                tya
                bcc mt_nofiltjump
                lda mt_filtspdtbl-1,y          ;Take jump point
mt_nofiltjump
                sta mt_filtstep+1
mt_filtdone
mt_filtcutoff
                lda #$00
mt_storecutoff
                sta ghostfiltcutoff
mt_filtctrl
                lda #$00
                sta ghostfiltctrl
mt_filttype
                lda #$00
mt_masterfader
                ora #$0f                        ;Master volume fader
                sta ghostfilttype

                jsr mt_execchn
                ldx #$07
                jsr mt_execchn
                ldx #$0e

        ;Channel execution

mt_execchn
                dec mt_chncounter,x               ;See if tick 0
                beq mt_tick0

        ;Ticks 1-n

mt_notick0
                bpl mt_effects
                lda mt_chntempo,x               ;Reload tempo if negative

                cmp #$02
                bcs mt_nofunktempo              ;Funktempo: bounce between
                tay                             ;funktable indexes 0,1
                eor #$01
                sta mt_chntempo,x
                lda mt_funktempotbl,y
                sbc #$00

mt_nofunktempo
                sta mt_chncounter,x
mt_effects
                jmp mt_waveexec

        ;Sequencer repeat

mt_repeat
                sbc #REPEAT
                inc mt_chnrepeat,x
                cmp mt_chnrepeat,x
                bne mt_nonewpatt
mt_repeatdone
                lda #$00
                sta mt_chnrepeat,x
                beq mt_repeatdone2

        ;Tick 0

mt_tick0
                ldy mt_chnnewfx,x               ;Setup tick 0 FX jumps
                lda mt_tick0jumptbl,y
                sta mt_tick0jump1+1
                sta mt_tick0jump2+1

        ;Sequencer advance

mt_checknewpatt
                lda mt_chnpattptr,x             ;Fetch next pattern?
                bne mt_nonewpatt
mt_sequencer
                ldy mt_chnsongnum,x
                lda mt_songtbllo,y              ;Get address of sequence
                sta mt_temp1
                lda mt_songtblhi,y
                sta mt_temp2
                ldy mt_chnsongptr,x
                lda (mt_temp1),y                ;Get pattern from sequence
                cmp #LOOPSONG                   ;Check for loop
                bcc mt_noloop
                iny
                lda (mt_temp1),y
                tay
                lda (mt_temp1),y
mt_noloop
                cmp #TRANSDOWN                  ;Check for transpose
                bcc mt_notrans
                sbc #TRANS
                sta mt_chntrans,x
                iny
                lda (mt_temp1),y
mt_notrans
                cmp #REPEAT                     ;Check for repeat
                bcs mt_repeat
                sta mt_chnpattnum,x             ;Store pattern number
mt_repeatdone2
                iny
                tya
                sta mt_chnsongptr,x             ;Store songposition

        ;New note start

mt_nonewpatt
                ldy mt_chninstr,x
                lda mt_insgatetimer-1,y
                sta mt_chngatetimer,x
                lda mt_chnnewnote,x             ;Test new note init flag
                beq mt_nonewnoteinit
mt_newnoteinit
                sec
                sbc #NOTE
                sta mt_chnnote,x
                lda #$00
                sta mt_chnfx,x                  ;Reset effect
                sta mt_chnnewnote,x             ;Reset newnote action
                lda mt_insvibdelay-1,y          ;Load instrument vibrato
                sta mt_chnvibdelay,x
                lda mt_insvibparam-1,y
                sta mt_chnparam,x
                lda mt_chnnewfx,x               ;If toneportamento, skip
                cmp #TONEPORTA                  ;most of note init
                beq mt_nonewnoteinit

                lda mt_insfirstwave-1,y         ;Load first frame waveform
                beq mt_skipwave
                cmp #$fe
                bcs mt_skipwave2                ;Skip waveform but load gate
                sta mt_chnwave,x
                lda #$ff
mt_skipwave2
                sta mt_chngate,x                ;Reset gateflag
mt_skipwave

                lda mt_inspulseptr-1,y          ;Load pulseptr (if nonzero)
                beq mt_skippulse
                sta mt_chnpulseptr,x
                lda #$00                        ;Reset pulse step duration
                sta mt_chnpulsetime,x
mt_skippulse
                lda mt_insfiltptr-1,y           ;Load filtptr (if nonzero)
                beq mt_skipfilt
                sta mt_filtstep+1
                lda #$00
                sta mt_filttime+1
mt_skipfilt

                lda mt_inswaveptr-1,y           ;Load waveptr
                sta mt_chnwaveptr,x

                lda mt_inssr-1,y                ;Load Sustain/Release
                sta ghostsr,x
                lda mt_insad-1,y                ;Load Attack/Decay
                sta ghostad,x

                lda mt_chnnewparam,x            ;Execute tick 0 FX after
mt_tick0jump1
                                  ;newnote init
                jsr mt_tick0_0
                jmp mt_loadregs

mt_wavecmd
                jmp mt_execwavecmd

        ;Tick 0 effect execution

mt_nonewnoteinit
                lda mt_chnnewparam,x            ;No new note init: exec tick 0
mt_tick0jump2
                jsr mt_tick0_0                  ;FX, and wavetable afterwards

        ;Wavetable execution

mt_waveexec
                ldy mt_chnwaveptr,x
                beq mt_wavedone
                lda mt_wavetbl-1,y
                cmp #$10                        ;0-15 used as delay
                bcs mt_nowavedelay              ;+ no wave change
                cmp mt_chnwavetime,x
                beq mt_nowavechange
                inc mt_chnwavetime,x
                bne mt_wavedone
mt_nowavedelay
                sbc #$10
                cmp #$e0
                bcs mt_nowavechange
                sta mt_chnwave,x
mt_nowavechange
                lda mt_wavetbl,y
                cmp #LOOPWAVE                  ;Check for wavetable jump
                iny
                tya
                bcc mt_nowavejump
                lda mt_notetbl-1,y
mt_nowavejump
                sta mt_chnwaveptr,x
                lda #$00
                sta mt_chnwavetime,x

                lda mt_wavetbl-2,y
                cmp #$e0
                bcs mt_wavecmd

                lda mt_notetbl-2,y

                bne mt_wavefreq                 ;No frequency-change?

        ;No frequency-change / continuous effect execution

mt_wavedone
                lda mt_chncounter,x             ;No continuous effects on tick0
                beq mt_gatetimer
                ldy mt_chnfx,x
                sty mt_effectnum+1
                lda mt_effectjumptbl,y
                sta mt_effectjump+1
                ldy mt_chnparam,x
mt_setspeedparam
                lda mt_speedlefttbl-1,y
                bmi mt_calculatedspeed
mt_normalspeed
                sta mt_temp2
                lda mt_speedrighttbl-1,y
                sta mt_temp1
                jmp mt_effectjump
mt_calculatedspeed
                lda mt_speedrighttbl-1,y
                sta mt_cscount+1
                sty mt_csresty+1
                ldy mt_chnlastnote,x
                lda mt_freqtbllo-FIRSTNOTEMINUSONE,y
                sec
                sbc mt_freqtbllo-FIRSTNOTE,y
                sta mt_temp1
                lda mt_freqtblhi-FIRSTNOTEMINUSONE,y
                sbc mt_freqtblhi-FIRSTNOTE,y
mt_cscount
     ldy #$00
                beq mt_csresty
mt_csloop
      lsr
                ror mt_temp1
                dey
                bne mt_csloop
mt_csresty
     ldy #$00
                sta mt_temp2
mt_effectjump
                jmp mt_effect_0

        ;Setting note frequency

mt_wavefreq
                bpl mt_wavenoteabs
                adc mt_chnnote,x
                and #$7f
mt_wavenoteabs
                sta mt_chnlastnote,x
                tay
mt_wavenote
                lda #$00                        ;Reset vibrato phase
                sta mt_chnvibtime,x
                lda mt_freqtbllo-FIRSTNOTE,y
                sta ghostfreqlo,x
                lda mt_freqtblhi-FIRSTNOTE,y
mt_storefreqhi
                sta ghostfreqhi,x

        ;Check for new note fetch

mt_done
                lda mt_chncounter,x             ;Check for gateoff timer
mt_gatetimer
                cmp mt_chngatetimer,x

                beq mt_getnewnote               ;Fetch new notes if equal

        ;Pulse execution
mt_pulseexec
                ldy mt_chnpulseptr,x            ;See if pulse stopped
                beq mt_pulseskip
                ora mt_chnpattptr,x             ;Skip when sequencer executed
                beq mt_pulseskip
                lda mt_chnpulsetime,x           ;Pulse step counter time left?
                bne mt_pulsemod
mt_newpulsestep
                lda mt_pulsetimetbl-1,y         ;Set pulse, or new modulation
                bpl mt_newpulsemod              ;step?
mt_setpulse
                sta ghostpulsehi,x
                lda mt_pulsespdtbl-1,y          ;Lowbyte
                sta ghostpulselo,x
                jmp mt_nextpulsestep
mt_newpulsemod
                sta mt_chnpulsetime,x
mt_pulsemod
                lda mt_pulsespdtbl-1,y          ;Take pulse speed
                clc
                bpl mt_pulseup
                dec ghostpulsehi,x
mt_pulseup
                adc ghostpulselo,x             ;Add pulse lowbyte
                sta ghostpulselo,x
                bcc mt_pulsenotover
                inc ghostpulsehi,x
mt_pulsenotover
                dec mt_chnpulsetime,x
                bne mt_pulsedone2

mt_nextpulsestep
                lda mt_pulsetimetbl,y           ;Jump in pulsetable?
                cmp #LOOPPULSE
                iny
                tya
                bcc mt_nopulsejump
                lda mt_pulsespdtbl-1,y          ;Take jump point
mt_nopulsejump
                sta mt_chnpulseptr,x
mt_pulsedone
mt_pulsedone2
mt_pulseskip


                jmp mt_loadregs

        ;New note fetch

mt_getnewnote
                ldy mt_chnpattnum,x
                lda mt_patttbllo,y
                sta mt_temp1
                lda mt_patttblhi,y
                sta mt_temp2
                ldy mt_chnpattptr,x
                lda (mt_temp1),y
                cmp #FX
                bcc mt_instr                    ;Instr. change
                cmp #NOTE
                bcc mt_fx                       ;FX
                cmp #FIRSTPACKEDREST
                bcc mt_note                     ;Note only

        ;Packed rest handling

mt_packedrest
                lda mt_chnpackedrest,x
                bne mt_packedrestnonew
                lda (mt_temp1),y
mt_packedrestnonew
                adc #$00
                sta mt_chnpackedrest,x
                beq mt_rest
                bne mt_loadregs

        ;Instrument change

mt_instr
                sta mt_chninstr,x               ;Instrument change, followed
                iny
                lda (mt_temp1),y                ;by either FX or note

                cmp #NOTE
                bcs mt_note

        ;Effect change

mt_fx
                cmp #FXONLY                     ;Note follows?
                and #$0f
                sta mt_chnnewfx,x
                beq mt_fx_noparam               ;Effect 0 - no param.
                iny
                lda (mt_temp1),y
                sta mt_chnnewparam,x
mt_fx_noparam
                bcs mt_rest
mt_fx_getnote
                iny
                lda (mt_temp1),y

        ;Note handling

mt_note
                cmp #REST                   ;Rest or gateoff/on?
                bcc mt_normalnote
                beq mt_rest
mt_gate
                ora #$f0
                bne mt_setgate

        ;Prepare for note start; perform hardrestart

mt_normalnote
                adc mt_chntrans,x
                sta mt_chnnewnote,x
                lda mt_chnnewfx,x           ;If toneportamento, no gateoff
                cmp #TONEPORTA
                beq mt_rest
                lda mt_chninstr,x
                cmp #FIRSTNOHRINSTR         ;Instrument order:
                bcs mt_nohr_legato          ;With HR - no HR - legato
                lda #SRPARAM                ;Hard restart 
                sta ghostsr,x
                lda #ADPARAM
                sta ghostad,x
            
mt_skiphr
                lda #$fe
mt_setgate
                sta mt_chngate,x

        ;Check for end of pattern

mt_rest
                iny
                lda (mt_temp1),y
                beq mt_endpatt
                tya
mt_endpatt
                sta mt_chnpattptr,x

        ;Load voice registers

mt_loadregs
mt_loadregswaveonly
                lda mt_chnwave,x
                and mt_chngate,x
                sta ghostwave,x
                rts

mt_nohr_legato
                cmp #FIRSTLEGATOINSTR
                bcc mt_skiphr
                bcs mt_rest

        ;Sound FX code


        ;Wavetable command exec

mt_execwavecmd
                and #$0f
                sta mt_temp1
                lda mt_notetbl-2,y
                sta mt_temp2
                ldy mt_temp1
                cpy #$05
                bcs mt_execwavetick0
mt_execwavetickn
                sty mt_effectnum+1
                lda mt_effectjumptbl,y
                sta mt_effectjump+1
                ldy mt_temp2
                jmp mt_setspeedparam
mt_execwavetick0
                lda mt_tick0jumptbl,y
                sta mt_execwavetick0jump+1
                lda mt_temp2
mt_execwavetick0jump
                jsr mt_tick0_0
                jmp mt_done

mt_tick0jumptbl
                BYTE <mt_tick0_0
                BYTE <mt_tick0_12
                BYTE <mt_tick0_12
                BYTE <mt_tick0_34
                BYTE <mt_tick0_34
                BYTE <mt_tick0_5
                BYTE <mt_tick0_6
                BYTE <mt_tick0_7
                BYTE <mt_tick0_8
                BYTE <mt_tick0_9
                BYTE <mt_tick0_a
                BYTE <mt_tick0_b
                BYTE <mt_tick0_c
                BYTE <mt_tick0_d
                BYTE <mt_tick0_e
                BYTE <mt_tick0_f

mt_effectjumptbl
                BYTE <mt_effect_0
                BYTE <mt_effect_12
                BYTE <mt_effect_12
                BYTE <mt_effect_3
                BYTE <mt_effect_4

mt_funktempotbl
                BYTE  8,5


              ;Normal channel variables

mt_chnsongptr
                BYTE  0
mt_chntrans
                BYTE  0
mt_chnrepeat
                BYTE  0
mt_chnpattptr
                BYTE  0
mt_chnpackedrest
                BYTE  0
mt_chnnewfx
                BYTE  0
mt_chnnewparam
                BYTE  0

                BYTE  0,0,0,0,0,0,0
                BYTE  0,0,0,0,0,0,0

mt_chnfx
                BYTE  0
mt_chnparam
                BYTE  0
mt_chnnewnote
                BYTE  0
mt_chnwaveptr
                BYTE  0
mt_chnwave
                BYTE  0
mt_chnpulseptr
                BYTE  0
mt_chnpulsetime
                BYTE  0

                BYTE  0,0,0,0,0,0,0
                BYTE  0,0,0,0,0,0,0

mt_chnsongnum
                BYTE  0
mt_chnpattnum
                BYTE  0
mt_chntempo
                BYTE  0
mt_chncounter
                BYTE  0
mt_chnnote
                BYTE  0
mt_chninstr
                BYTE  1
mt_chngate
                BYTE  $fe

                BYTE  1,0,0,0,0,1,$fe
                BYTE  2,0,0,0,0,1,$fe


mt_chnvibtime
                BYTE  0
mt_chnvibdelay
                BYTE  0
mt_chnwavetime
                BYTE  0
mt_chnfreqlo
                BYTE  0
mt_chnfreqhi
                BYTE  0
mt_chnpulselo
                BYTE  0
mt_chnpulsehi
                BYTE  0

                BYTE  0,0,0,0,0,0,0
                BYTE  0,0,0,0,0,0,0

mt_chnad
                BYTE  0
mt_chnsr
                BYTE  0
mt_chnsfx
                BYTE  0
mt_chnsfxlo
                BYTE  0
mt_chnsfxhi
                BYTE  0
mt_chngatetimer
                BYTE  0
mt_chnlastnote
                BYTE  0

                BYTE  0,0,0,0,0,0,0
                BYTE  0,0,0,0,0,0,0




ghostregs
    BYTE  0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,0,0
ghostfreqlo     = ghostregs+0
ghostfreqhi     = ghostregs+1
ghostpulselo    = ghostregs+2
ghostpulsehi    = ghostregs+3
ghostwave       = ghostregs+4
ghostad         = ghostregs+5
ghostsr         = ghostregs+6
ghostfiltcutlow = ghostregs+21
ghostfiltcutoff = ghostregs+22
ghostfiltctrl   = ghostregs+23
ghostfilttype   = ghostregs+24

        ;Songdata & frequencytable will be inserted by the relocator here


mt_insgatetimer
                BYTE $ff
mt_insvibdelay
                BYTE $ff

mt_insfirstwave
                BYTE 0

mt_inspulseptr
                BYTE 0
mt_insfiltptr
                BYTE 0
mt_inswaveptr
                BYTE 0
mt_inssr
                BYTE 0
mt_insad
                BYTE 0
mt_insvibparam
                BYTE 0


mt_freqtbllo
                BYTE 0

mt_freqtblhi
                BYTE 0 


mt_songtbllo
                BYTE 0
mt_songtblhi
                BYTE 0

mt_wavetbl
                BYTE 0

mt_notetbl
                BYTE 0

mt_pulsetimetbl
                BYTE 0
mt_pulsespdtbl
                BYTE 0


mt_speedlefttbl
                BYTE 0
mt_speedrighttbl 
                BYTE 0
mt_filttimetbl
                BYTE 0
mt_filtspdtbl
                BYTE 0

mt_patttbllo    
                BYTE 0
mt_patttblhi
                BYTE 0


 


