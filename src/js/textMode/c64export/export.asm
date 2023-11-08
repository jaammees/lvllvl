*=$801
basic_start_code
!byte    $0B, $08, $0A, $00, $9E, $32, $30, $38, $30, $00, $00, $00

; zero page 
copy_from_low           = $4d
copy_from_high          = $4e

copy_to_low             = $4f
copy_to_high            = $50

frame_finished          = $51

back_buffer_high        = $52
front_buffer_high       = $53

frame_ptr_low           = $54
frame_ptr_high          = $55

delay_counter           = $56

temp                    = $57
ch1_in_new_note         = $58
ch2_in_new_note         = $59
ch3_in_new_note         = $5a
tick                    = $5c

temp_low                = $5d
temp_high               = $5e
check_keys_enabled      = $5f
key_table_low           = $60
key_table_high          = $61
check_instr_enabled     = $62
instr_table_low         = $63
instr_table_high        = $64

trig                    = $65

copy_from_low2           = $66
copy_from_high2          = $67

copy_to_low2             = $68
copy_to_high2            = $69

; frame info.. can fit this in just after init code
first_frame_low             = $0be8
first_frame_high            = $0be9

next_char_frame_type        = $0bea
next_char_frame_addr_low    = $0beb
next_char_frame_addr_high   = $0bec
next_char_frame_delay       = $0bed
next_color_frame_type       = $0bee
next_color_frame_addr_low   = $0bef
next_color_frame_addr_high  = $0bf0
next_color_frame_bg1        = $0bf1
next_color_frame_bg2        = $0bf2
next_color_frame_bg3        = $0bf3
next_color_frame_bg4        = $0bf4

animated_chars_table_low    = $0bf5
animated_chars_table_high   = $0bf6

animated_bg_colors_table_low    = $0bf7
animated_bg_colors_table_high   = $0bf8



ch1_newnote                 = $1485
ch1_tempo                   = $149a
ch1_counter                 = $149b
ch1_note                    = $149c
ch1_instr                   = $149d
ch1_gate                    = $149e

ch2_tempo                   = $14a1
ch2_counter                 = $14a2
ch2_note                    = $14a3
ch2_instr                   = $14a4
ch2_gate                    = $14a5

ch3_tempo                   = $14a8
ch3_counter                 = $14a9
ch3_note                    = $14aa
ch3_instr                   = $14ab
ch3_gate                    = $14ac

; config
*= $0810
config_values

border_color
;        BYTE   $02    
!byte   $02     
extended_color_mode
;        BYTE   $01
!byte   $00
custom_chars 
;        BYTE   $00
!byte   $00

sid 
;        BYTE   $00
!byte   $00

sidspeed
;        BYTE   $01
!byte   $01

sid_init_addr_low
;        BYTE   $03
!byte   $00
sid_init_addr_high
;        BYTE   $10
!byte   $10

sid_play_addr_low
;        BYTE   $12
!byte   $03
sid_play_addr_high
;        BYTE   $10
!byte   $10


frame_ptr_start_low
;        BYTE   $00
!byte   $00
frame_ptr_start_high
;        BYTE   $80
!byte   $80

animated_chars_table_start_low
;        BYTE   $00
!byte   $00
animated_chars_table_start_high
;         BYTE   $00
!byte   $00

animated_bg_colors_table_start_low
;        BYTE   $00
!byte   $00
animated_bg_colors_table_start_high
;         BYTE   $00
!byte   $00

; init code, only run once
*= $0820
init_code
        ;$01=$36 -> RAM       visible A000-C000, IO visible at D000-E000, Kernal Rom Visible at E000-FFFF
        lda #$36        ; $36 = 0011 0110
        sta $01         ; RAM visible at $A000-$BFFF; KERNAL ROM visible at $E000-$FFFF, I/O area visible at $D000-$DFFF. 

        ; store location of frame ptrs
        lda frame_ptr_start_low
        sta first_frame_low
        lda frame_ptr_start_high
        sta first_frame_high
        
        lda animated_chars_table_start_low
        sta animated_chars_table_low
        lda animated_chars_table_start_high
        sta animated_chars_table_high

        lda animated_bg_colors_table_start_low
        sta animated_bg_colors_table_low
        lda animated_bg_colors_table_start_high
        sta animated_bg_colors_table_high


        lda border_color
        sta $d020       ; border color


        ; turn off multicolor mode
        lda $d016
        and #$ef
        sta $d016
        
        lda extended_color_mode
        cmp #$01
        bne test_multi_color
  
setup_extended_color_mode
        lda $d011    ; turn on extended color mode
        ora #$40
        sta $d011
        jmp setup_custom_chars


test_multi_color
        cmp #$02
        bne setup_custom_chars

setup_multi_color_mode
        lda $d016    ; turn on extended color mode
        ora #$10
        sta $d016


setup_custom_chars

        lda custom_chars
        cmp #$01
        bne setup_sid

        lda $d018       
        ora #$0e
        sta $d018

setup_sid

        lda sid
        cmp #$01
        bne disable_sid

        lda sid_init_addr_low
        sta sid_init_jsr+1
        lda sid_init_addr_high
        sta sid_init_jsr+2

        lda sid_play_addr_low
        sta sid_play_jsr+1
        lda sid_play_addr_high
        sta sid_play_jsr+2

        lda sidspeed
        cmp #$01
        beq disable_sid_speed2

        lda sid_play_addr_low
        sta sid_play_jsr2+1
        lda sid_play_addr_high
        sta sid_play_jsr2+2

        jmp setup_screen

disable_sid
        ; put NOP in the sid init and play instructions
        lda #$ea 
        sta sid_init_jsr
        sta sid_init_jsr+1
        sta sid_init_jsr+2

        sta sid_play_jsr
        sta sid_play_jsr+1
        sta sid_play_jsr+2

disable_sid_speed2
        lda #$ea 
        sta sid_play_jsr2
        sta sid_play_jsr2+1
        sta sid_play_jsr2+2


setup_screen
        ; set the screen location to 0400    xxx1 xxxx
        lda $d018
        and #$0f                  
        ora #$10                  
        sta $d018

        ; front buffer is 0400, back buffer is 0800
        lda #$04
        sta front_buffer_high
        lda #$08
        sta back_buffer_high


        lda #$00
        sta ch1_in_new_note
        sta ch2_in_new_note
        sta ch3_in_new_note

        ;; init effects
        sta check_keys_enabled
        sta check_instr_enabled

        jsr init_effects
        
        jmp start


;-------------- end if init code ---------------





*=$0c00
start
        lda first_frame_low
        sta frame_ptr_low
        lda first_frame_high
        sta frame_ptr_high

        ; load first frame into back buffer
        jsr get_next_frame_info
        jsr tick4
        lda #$01
        sta delay_counter


        sei             ;disable maskable IRQs

        lda #$00        ; sid tune 0
sid_init_jsr
        jsr $1000       ;init_sid

        lda #$7f
        sta $dc0d  ;disable timer interrupts which can be generated by the two CIA chips
        sta $dd0d  ;the kernal uses such an interrupt to flash the cursor and scan the keyboard, so we better
                   ;stop it.

        lda $dc0d  ;by reading this two registers we negate any pending CIA irqs.
        lda $dd0d  ;if we don't do this, a pending CIA irq might occur after we finish setting up our irq.
                   ;we don't want that to happen.

        lda #$01   ;this is how to tell the VICII to generate a raster interrupt
        sta $d01a

        lda #$ff   ;this is how to tell at which rasterline we want the irq to be triggered
        sta $d012

        lda $d011  ;as there are more than 256 rasterlines, the topmost bit of $d011 serves as
        and #$7f   ;the 8th bit for the rasterline we want our irq to be triggered.               
        sta $d011  ;clear it
                   

        lda #$35   ;we turn off the BASIC and KERNAL rom here
        sta $01    ;the cpu now sees RAM everywhere except at $d000-$e000, where still the registers of
                   ;SID/VICII/etc are visible

        lda #<irq  ;this is how we set up
        sta $fffe  ;the address of our interrupt code
        lda #>irq
        sta $ffff

        cli        ;enable maskable interrupts again

    
loop
        jmp loop


        ; ---------------------interrupt start--------------------------------------------
irq =*

        pha        ;store register A in stack
        txa
        pha        ;store register X in stack
        tya
        pha        ;store register Y in stack

; 0c51

        lda #$ff   ;this is the orthodox and safe way of clearing the interrupt condition of the VICII.
        sta $d019  ;if you don't do this the interrupt condition will be present all the time and you end
                   ;up having the CPU running the interrupt code all the time, as when it exists the
                   ;interrupt, the interrupt request from the VICII will be there again regardless of the
                   ;rasterline counter.

                   ;it's pretty safe to use inc $d019 (or any other rmw instruction) for brevity, they
                   ;will only fail on hardware like c65 or supercpu. c64dtv is ok with this though.
;        inc $d020

sid_play_jsr
        jsr $1012       ; play sid

        jsr animate_chars
;        jsr animate_bg_colors

        lda tick                ; cant do trigger stuff if just ticked.
        beq goto_play_frames

        lda check_keys_enabled
        beq instrument_triggers    ; if lda is 0, zero flag is set

        jsr check_keys

instrument_triggers
        lda check_instr_enabled
        beq goto_play_frames

        jsr check_instrument

goto_play_frames
        jsr play_frames


wait_for_raster
        lda $d011
        and #$80    ; zero flag is set if zero
        bne wait_for_raster

        lda $d012
        cmp #$80
        bcc wait_for_raster

sid_play_jsr2
        jsr $1012

;        dec $d020
irqout
        pla
        tay        ;restore register Y from stack (remember stack is FIFO: First In First Out)
        pla
        tax        ;restore register X from stack
        pla        ;restore register A from stack

        rti        ;Return From Interrupt, this will load into the Program Counter register the address
                   ;where the CPU was when the interrupt condition arised which will make the CPU continue
                   ;the code it was interrupted at also restores the status register of the CPU

;-----------------------------------------------------------
play_frames
        dec delay_counter
        bne ticks ; counter not zero yet, do ticks

        lda #$00
        sta tick

        ; delay is zero, display the next frame...
        jmp display_next_frame

ticks
;        lda delay_counter 

        jsr effects_tick
        
        
        inc tick
        lda tick
        cmp #$01        ;  start preparing for next frame
        bne tick2test
        jmp get_next_frame_info
tick2test        
        cmp #$02        ;  start preparing for next frame
        bne tick3test
        jmp tick4
tick3test
        cmp #$03        ;  start preparing for next frame
        bne tick4test
        jmp tick3
tick4test
        cmp #$04        ;  start preparing for next frame
        bne tick5test
        jmp tick2
tick5test
        cmp #$05        ;  start preparing for next frame
        bne tickgreater5
        jmp tick1
tickgreater5
        rts

display_next_frame
        lda next_char_frame_delay
        sta delay_counter

        jsr swap_buffers

        ; update colors...
        lda next_color_frame_bg1
        sta $d021       ; background color
        lda next_color_frame_bg2
        sta $d022       ; background color
        lda next_color_frame_bg3
        sta $d023       ; background color
        lda next_color_frame_bg4
        sta $d024       ; background color

        ; copy color data
        lda next_color_frame_addr_low
        sta copy_from_low
        lda next_color_frame_addr_high
        sta copy_from_high

        lda #$00
        sta copy_to_low
        lda #$d8
        sta copy_to_high


        lda next_color_frame_type
        cmp #$01
        beq whole_frame_color_type             

        ; just copy color changes
        jsr data_changes
        jmp read_effects        ; read the effects for this frame
;        rts 

whole_frame_color_type
        jsr copy_data_4bit
        jmp read_effects         ; read the effects for this frame
;        rts

check_trigger_table

        ldy #$00    ; going to use y to loop through keys

        
check_trigger_loop


        lda (temp_low),y    ; load in the test key
        
        cmp #$00              ; have we reached end of table?
        beq check_trigger_done   ; reached end, so exit

        iny
        iny
        iny
        iny

        cmp trig            ; check test key against key pressed
        bne check_trigger_loop

        ; found trigger !

        dey 
        dey
        dey

        lda (temp_low),y
        jsr effects_trigger

        lda (temp_low),y
        beq trigger_goto_frame

        cmp #$02
        beq switch_charset

        cmp #$01
        beq force_next_frame
        rts
        
force_next_frame        
        lda #$04
        sta delay_counter
;        sta force_next_frame
        rts

switch_charset
        iny
        lda $d018
        and #$f1
        ora (temp_low),y
        sta $d018
        rts        

trigger_goto_frame
        iny
        lda (temp_low),y
        sta frame_ptr_low
        iny

        lda (temp_low),y
        sta frame_ptr_high


        ; set this as tick 1 so the char data will be copied
        lda #$00
        sta tick


        ; make the delay counter 4 so the next frame will be disp next tick
        ;lda #$05
        lda #$03
        sta delay_counter
check_trigger_done
        rts

check_keys

        lda #00
        jsr scan_key
        sta trig                 ; store the key to check in temp

        lda key_table_low        ; load in pointer to keys table
        sta temp_low
        lda key_table_high
        sta temp_high
        jsr check_trigger_table


check_keys_done


        rts

check_instrument

        lda ch1_newnote
        cmp #$00
        beq reset_ch1_new_note

        lda ch1_in_new_note
        cmp #$00
        bne ch1nextchannel

        lda #$01
        sta ch1_in_new_note

        lda ch1_instr

        sta trig                 ; store the instrument to check in temp

        lda instr_table_low        ; load in pointer to keys table
        sta temp_low
        lda instr_table_high
        sta temp_high


        jsr check_trigger_table

        rts

reset_ch1_new_note
        lda #$00
        sta ch1_in_new_note

ch1nextchannel    

        rts

get_next_frame_info
        ldy #$00
        lda (frame_ptr_low),y

        ; #$00 indicates a jump
        cmp #$00
        bne get_next_frame_info1

        ; next two bytes are where to jump to
        iny
        lda (frame_ptr_low),y
        sta temp  ;frame_ptr_low

        iny
        lda (frame_ptr_low),y
        sta frame_ptr_high

        lda temp
        sta frame_ptr_low

        ldy #$00

        lda (frame_ptr_low),y

get_next_frame_info1

        ; read in the next frames info

        sta next_char_frame_type

        iny
        lda (frame_ptr_low),y
        sta next_char_frame_addr_low

        iny
        lda (frame_ptr_low),y
        sta next_char_frame_addr_high

        iny
        lda (frame_ptr_low),y
        sta next_char_frame_delay

        iny
        lda (frame_ptr_low),y
        sta next_color_frame_type

        iny
        lda (frame_ptr_low),y
        sta next_color_frame_addr_low

        iny
        lda (frame_ptr_low),y
        sta next_color_frame_addr_high

        iny
        lda (frame_ptr_low),y
        sta next_color_frame_bg1

        iny
        lda (frame_ptr_low),y
        sta next_color_frame_bg2

        iny
        lda (frame_ptr_low),y
        sta next_color_frame_bg3

        iny
        lda (frame_ptr_low),y
        sta next_color_frame_bg4

        ; add y accumulator to frame_ptr
        tya
        clc                    ; clear carry
        adc frame_ptr_low              
        sta frame_ptr_low

        lda frame_ptr_high     ; add 0 with carry to higher byte 
        adc #00
        sta frame_ptr_high

        lda next_char_frame_type  ; if its the whole frame type, then we're done
        cmp #$01
        bne setup_change_frame_type
        rts

setup_change_frame_type
        ; its changes, so need to copy to back buffer
        jsr copy_front_to_back_buffer

        rts

read_effects
        ldy #$00
        ; effects
read_effects_loop
        iny
        lda (frame_ptr_low),y

        ; #$00 means no effects 
        cmp #$00
        beq frame_info_end

        cmp #$01
        bne frame_effect_2

        ; enable check keys
        lda #$01
        sta check_keys_enabled

        iny
        lda (frame_ptr_low),y
        sta key_table_low

        iny
        lda (frame_ptr_low),y
        sta key_table_high

        jmp read_effects_loop

frame_effect_2
        cmp #$02
        bne frame_effect_3

        ; disable check keys
        lda #$00
        sta check_keys_enabled
        jmp read_effects_loop

frame_effect_3
        cmp #$03
        bne frame_effect_4

        ; enable check instr
        lda #$01
        sta check_instr_enabled

        iny
        lda (frame_ptr_low),y
        sta instr_table_low

        iny
        lda (frame_ptr_low),y
        sta instr_table_high

        jmp read_effects_loop



frame_effect_4
        cmp #$04
        bne frame_effect_5

        ; disable check instruments
        lda #$00
        sta check_instr_enabled
        jmp read_effects_loop

frame_effect_5

frame_info_end
        iny 

        ; add y accumulator to frame_ptr
        tya

;        sta $d020

        clc                    ; clear carry
        adc frame_ptr_low                ; add 40 with carry to lower byte
        sta frame_ptr_low

        lda frame_ptr_high     ; add 0 with carry to higher byte 
        adc #00
        sta frame_ptr_high
        rts        
tick4
        ; load in location of character data
        lda next_char_frame_addr_low
        sta copy_from_low
        lda next_char_frame_addr_high
        sta copy_from_high

        lda #$00
        sta copy_to_low
        lda back_buffer_high
        sta copy_to_high


        ; check what type of frame it is..
        lda next_char_frame_type
        cmp #$01
        beq full_frame_type

        cmp #$02
        beq changes_frame_type

        ; rle data
        jsr copy_rle_data
        rts

changes_frame_type
        ; its changes, 
        lda #$00
        sta frame_finished

        jsr data_changes
        rts


full_frame_type
        ; copy all chars to back buffer

        jsr copy_data

        lda #$01
        sta frame_finished   ; this frame's data is over..
        rts

tick3

        ; if not finished with changes, continue updating
        lda frame_finished  ; finished copying frame data ?
        cmp #$00
        bne tick3done

        jsr data_changes

tick3done
        rts

tick2
        lda frame_finished  ; finished copying frame data ?
        cmp #$00
        bne tick2done

        jsr data_changes

tick2done
        rts
tick1
        rts


;------------ end of play frames...

copy_front_to_back_buffer

        ; copy front buffer to back buffer
        lda #$00
        sta copy_from_low
        lda front_buffer_high
        sta copy_from_high

        lda #$00
        sta copy_to_low
        lda back_buffer_high
        sta copy_to_high

        jsr copy_data

        rts


swap_buffers
        ldx back_buffer_high         ; load value of current back buffer
        cpx #$04                     ; is it 0400
        bne swap_buffers_1

        ; set front buffer to 0400, back buffer to 0800
        lda #$04
        sta front_buffer_high
        lda #$08
        sta back_buffer_high

        ; set screen location to $0400
        lda $d018
        and #$0f
        ora #$10
        sta $d018

        rts

swap_buffers_1
        ; set front buffer to 0800, back buffer to 0400
        lda #$08
        sta front_buffer_high
        lda #$04
        sta back_buffer_high

        ; set screen location to $0800
        lda $d018
        and #$0f
        ora #$20
        sta $d018

        rts


copy_data
;        ldy xoffset
        ldy #$0
        ldx #25    ; number of lines to copy


copy_data_line
        lda (copy_from_low),y
        sta (copy_to_low),y
        iny
        lda (copy_from_low),y
        sta (copy_to_low),y
        iny
        lda (copy_from_low),y
        sta (copy_to_low),y
        iny
        lda (copy_from_low),y
        sta (copy_to_low),y
        iny
        lda (copy_from_low),y
        sta (copy_to_low),y
        iny
        lda (copy_from_low),y
        sta (copy_to_low),y
        iny
        lda (copy_from_low),y
        sta (copy_to_low),y
        iny
        lda (copy_from_low),y
        sta (copy_to_low),y
        iny
        lda (copy_from_low),y
        sta (copy_to_low),y
        iny
        lda (copy_from_low),y
        sta (copy_to_low),y
        iny

        cpy #40                 ; have we copied 40 chars? (10x4)
        bne copy_data_line
        
        dex
        beq copy_data_done
        
        ldy #0                  ; back to start of line


        ; increase where copy from by 40
        clc                    ; clear carry
        lda copy_from_low
        adc #40                ; add 40 with carry to lower byte
        sta copy_from_low

        lda copy_from_high     ; add 0 with carry to higher byte 
        adc #00
        sta copy_from_high


        ; increase where copy to by 40
        clc                     ; clear carry
        lda copy_to_low
        adc #40                 ; add 40 with carry to lower byte
        sta copy_to_low

        lda copy_to_high        ; add 0 with carry to higher byte 
        adc #00
        sta copy_to_high

        jmp copy_data_line

copy_data_done

        rts 


copy_data_4bit
        ldy #0
        ldx #25

copy_data_4bit_line

        lda (copy_from_low),y
        sta (copy_to_low),y 
        iny
        lsr
        lsr
        lsr
        lsr
;        lda (copy_from_low),y
        sta (copy_to_low),y

        iny

        lda (copy_from_low),y
        sta (copy_to_low),y
        iny
        lsr
        lsr
        lsr
        lsr
        ;lda (copy_from_low),y
        sta (copy_to_low),y

        iny

        lda (copy_from_low),y
        sta (copy_to_low),y
        iny
        lsr
        lsr
        lsr
        lsr
        ;lda (copy_from_low),y
        sta (copy_to_low),y

        iny

        lda (copy_from_low),y
        sta (copy_to_low),y
        iny
        lsr
        lsr
        lsr
        lsr
        ;lda (copy_from_low),y
        sta (copy_to_low),y

        iny

        lda (copy_from_low),y
        sta (copy_to_low),y
        iny
        lsr
        lsr
        lsr
        lsr
        ;lda (copy_from_low),y
        sta (copy_to_low),y

        iny


        cpy #40                 ; have we copied 40 chars? (10x4)
        bne copy_data_4bit_line
        
        dex
        beq copy_data_4bit_done
        
        ldy #0                  ; back to start of line


        ; increase where copy from by 40
        clc                    ; clear carry
        lda copy_from_low
        adc #40                ; add 40 with carry to lower byte
        sta copy_from_low

        lda copy_from_high     ; add 0 with carry to higher byte 
        adc #00
        sta copy_from_high


        ; increase where copy to by 40
        clc                     ; clear carry
        lda copy_to_low
        adc #40                 ; add 40 with carry to lower byte
        sta copy_to_low

        lda copy_to_high        ; add 0 with carry to higher byte 
        adc #00
        sta copy_to_high

        jmp copy_data_4bit_line

copy_data_4bit_done

        rts 



copy_rle_data
        ldy #00

        lda (copy_from_low),y
        bne continue_rle

        ; reached the end of the data
        lda #$01
        sta frame_finished

        rts

continue_rle
        tax

        inc copy_from_low
        bne rle_get_byte
        inc copy_from_high

rle_get_byte
        lda (copy_from_low),y
        inc copy_from_low
        bne write_rle_byte
        inc copy_from_high


write_rle_byte        
        sta (copy_to_low),y
        iny
        dex
        bne write_rle_byte

        tya

        clc
        adc copy_to_low
        sta copy_to_low

        lda copy_to_high
        adc #$00
        sta copy_to_high

        jmp copy_rle_data




; data changes are list:  offset, change, offset, change, ends in 00
data_changes
        ldx #$00

        ldy #$00
        lda (copy_from_low),y      ; load the first offset

next_change              
        ; add the offset to buffer ptr
        clc
        adc copy_to_low

        sta copy_to_low
        lda copy_to_high
        adc #$00
        sta copy_to_high


        ; increase the pointer to the change data
        inc copy_from_low     ; zero flag will be set if result is zero
        bne get_change
        inc copy_from_high
get_change



        lda (copy_from_low),y      ; load the character
        sta (copy_to_low),y 


        ; increase the pointer to the change data
        inc copy_from_low           ; zero flag will be set if result is zero
        bne get_offset
        inc copy_from_high

get_offset         
        lda (copy_from_low),y

        cmp #$0                     ; sequence ends with a 0 offset
        beq changes_done


        inx
        cpx #$ff                    ; only do up to 255 changes
        bne next_change

        ; reached max number of changes for this refresh... mark as not finished yet
        lda #$00
        sta frame_finished
        rts

changes_done        
        
        lda #$01                        ; mark frame as finished..
        sta frame_finished

        rts


*= $4000

animate_chars

;  inc $d020
;  rts
  lda #$38
  sta copy_to_high2
  lda #$00
  sta copy_to_low2
  

  
  lda animated_chars_table_low
  sta copy_from_low2
  
  lda animated_chars_table_high
  sta copy_from_high2
  
  
anim_char_start
  ; load number of ticks per frame
  ldy #$00
  lda (copy_from_low2), y
  
  ; if value is 0 then reached end of table
  cmp #$00
  beq animate_chars_done
  
  ldy #$01
  lda (copy_from_low2), y
  tax
  dex
  txa
  sta (copy_from_low2), y
  
  bne next_anim_char
  
  
  ; counter has reached 0
  
  ; load number of ticks per frame
  ldy #$00
  lda (copy_from_low2), y
  
  ; store in counter for the character
  iny
  sta (copy_from_low2), y
  
  ; load in character to animate
  iny

  ; get character offset
  lda (copy_from_low2), y
  
  clc                    ; clear carry
  adc copy_to_low2              
  sta temp_low

  
  iny
  lda (copy_from_low2),y
  adc copy_to_high2
  sta temp_high
  
  ; get the animation type
  iny
  lda (copy_from_low2),y
  
  cmp #$00
  bne anim_type_1
  jsr scroll_char_left
  jmp next_anim_char
anim_type_1
  cmp #$01
  bne anim_type_2
  jsr scroll_char_right
  jmp next_anim_char
anim_type_2
  cmp #$02
  bne anim_type_3
  jsr scroll_char_up
  jmp next_anim_char
anim_type_3
  cmp #$03
  bne anim_type_4
  jsr scroll_char_down
  jmp next_anim_char

anim_type_4
  jsr blink_char
  
next_anim_char

  clc
  
  ; add 5 to animated char table ptr
  lda copy_from_low2
  adc #$05              
  sta copy_from_low2

  lda copy_from_high2     ; add 0 with carry to higher byte 
  adc #00
  sta copy_from_high2
  
  jmp anim_char_start



animate_chars_done

;  dec $d020
  
  rts
  
blink_char
  ldy #$00

  lda #$ff
  eor (temp_low),y
  sta (temp_low),y
  iny

  lda #$ff
  eor (temp_low),y
  sta (temp_low),y
  iny

  lda #$ff
  eor (temp_low),y
  sta (temp_low),y
  iny

  lda #$ff
  eor (temp_low),y
  sta (temp_low),y
  iny

  lda #$ff
  eor (temp_low),y
  sta (temp_low),y
  iny

  lda #$ff
  eor (temp_low),y
  sta (temp_low),y
  iny

  lda #$ff
  eor (temp_low),y
  sta (temp_low),y
  iny

  lda #$ff
  eor (temp_low),y
  sta (temp_low),y
  iny

  rts
  
scroll_char_down

  ldy #$07
  lda (temp_low),y
  sta temp
  
  dey
  ; 3806
  lda (temp_low),y
  iny
  sta (temp_low),y
  dey
  dey
  
  ; 3805
  lda (temp_low),y
  iny
  sta (temp_low),y
  dey
  dey

  ; 3804
  lda (temp_low),y
  iny
  sta (temp_low),y
  dey
  dey

  ; 3803
  lda (temp_low),y
  iny
  sta (temp_low),y
  dey
  dey

  ; 3802
  lda (temp_low),y
  iny
  sta (temp_low),y
  dey
  dey

  ; 3801
  lda (temp_low),y
  iny
  sta (temp_low),y
  dey
  dey

  ; 3800
  lda (temp_low),y
  iny
  sta (temp_low),y
  dey
  
  lda temp
  sta (temp_low), y

;  lda $3800
;  sta temp
  
;  lda $3807
;  sta $3800

;  lda $3806
;  sta $3807

;  lda $3805
;  sta $3806
;  lda $3804
;  sta $3805
;  lda $3803
;  sta $3804
;  lda $3802
;  sta $3803
;  lda $3801
;  sta $3802
;  lda temp
;  sta $3801

  rts


scroll_char_up
  ldy #$00
  lda (temp_low), y
  sta temp
  
  iny
  lda (temp_low), y
  dey
  sta (temp_low), y
  iny
  iny

  lda (temp_low), y
  dey
  sta (temp_low), y
  iny
  iny

  lda (temp_low), y
  dey
  sta (temp_low), y
  iny
  iny

  lda (temp_low), y
  dey
  sta (temp_low), y
  iny
  iny

  lda (temp_low), y
  dey
  sta (temp_low), y
  iny
  iny

  lda (temp_low), y
  dey
  sta (temp_low), y
  iny
  iny

  lda (temp_low), y
  dey
  sta (temp_low), y
  iny

  lda temp
  sta (temp_low), y

  rts
  
scroll_char_right
  ldy #$00
  ldx #$08

scroll_char_right_cont
  dex

  lda temp_low
  sta scroll_char_right_addr1 + 1
  sta scroll_char_right_addr2 + 1

  lda temp_high
  sta scroll_char_right_addr1 + 2
  sta scroll_char_right_addr2 + 2


scroll_char_right_addr1
  lda $3800,x
  ror
scroll_char_right_addr2
  ror $3800,x
  
  txa
  cmp #$00
  bne scroll_char_right_cont

  rts

scroll_char_left
  ldy #$00
  ldx #$08
  

  lda temp_low
  sta scroll_char_left_addr1 + 1
  sta scroll_char_left_addr2 + 1

  lda temp_high
  sta scroll_char_left_addr1 + 2
  sta scroll_char_left_addr2 + 2
  
scroll_char_left_cont


  dex


scroll_char_left_addr1
  lda $3800,x
  rol
scroll_char_left_addr2
  rol $3800,x

  txa
  cmp #$00
  bne scroll_char_left_cont
  
  rts

animate_bg_colors
;  inc $d021
;  inc $d022
;  inc $d023
;  inc $d024
 
  lda #$d0
  sta copy_to_high
  lda #$21
  sta copy_to_low
  
  lda animated_bg_colors_table_low
  sta copy_from_low
  
  lda animated_bg_colors_table_high
  sta copy_from_high
  
  
anim_bg_color_start
  ; load number of ticks per frame
  ldy #$00
  lda (copy_from_low), y
  
  ; if value is 0 then reached end of table
  cmp #$00
  beq animate_bg_colors_done
  
  ldy #$01
  lda (copy_from_low), y
  tax
  dex
  txa
  sta (copy_from_low), y
  
  bne next_anim_bg_color
  
  
  ; counter has reached 0
  
  ; load number of ticks per frame
  ldy #$00
  lda (copy_from_low), y
  
  ; store in counter for the character
  iny
  sta (copy_from_low), y
  
  ; load in color to animate
  iny
  lda (copy_from_low), y
  
  
  
  clc                    ; clear carry
  adc copy_to_low              
  sta temp_low
  
  lda #$00
  adc copy_to_high
  sta temp_high
  
  ldy #$00
  lda (temp_low), y
  adc #$01
;  inc 
  sta (temp_low), y
  
  

next_anim_bg_color

  clc
  
  ; add 3 to animated char table ptr
  lda copy_from_low
  adc #$03              
  sta copy_from_low

  lda copy_from_high     ; add 0 with carry to higher byte 
  adc #00
  sta copy_from_high
  
  jmp anim_bg_color_start



animate_bg_colors_done

;  dec $d020
  
  rts
  

  
scan_key

;    inc $d020

    ;; set up the data direction registers
    lda #$0
    sta $dc03   ; port b ddr (input)
    lda #$ff
    sta $dc02   ; port a ddr (output)
            
    ; set which row being checked
    lda #$00
    sta $dc00   ; port a

    lda $dc01
    sta $11

    ; get column information
    lda $dc01       ; port b

    cmp #$ff
    beq nokey

    ; got column
    tay
    

    ; first row to test        
    lda #$7f      ;  0111 1111
    sta nokey2+1

    ; going to check 8 rows
    ldx #8
nokey2
    ;; this location has the row to check
    lda #0
    sta $dc00   ; port a
    
    ; set the carry flag
    sec
    ; set next row to check
    ror nokey2+1

    ; checked all rows yet?
    dex
    ; branch if minus
    bmi nokey

    ; get column information
    lda $dc01       ; port b
    cmp #$ff
    beq nokey2
            
    ; got row in X
    txa
    sta $12
    ora columntab,y

    sta $10

    sec
    
;    dec $d020
    rts
            
nokey
    clc
;    dec $d020
    lda #$0
    sta $10

    rts


columntab

!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff

!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff

!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff

!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$70

!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff

!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$60

!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$50

!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$ff
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$40
!byte $ff,$ff,$ff,$ff,$ff,$ff,$ff,$30
!byte $ff,$ff,$ff,$20,$ff,$10,$00,$ff

init_effects
  rts

";
