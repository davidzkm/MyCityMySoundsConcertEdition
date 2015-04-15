
# -------------------------------------------
# MSMK, Nov 2014
# -------------------------------------------

# ls *wav | # *wav *aiff in pipe
perl -e '$i=1; while(<>){chomp;$i+=1; print "$i $_, $i $_;\n"}'

# ohne duration (nur index + filename)
# kurze soundfiles
# ls clar2_0* | perl -e '$i=1; while(<>){chomp;$i+=1; print "$i $_, $i $_;\n"}'
# laengere soundfiles
# ls clar1_0* | perl -e '$i=1; while(<>){chomp;$i+=1; print "$i $_, $i $_;\n"}'


# -------------------------------------------
# -------------------------------------------
# -------------------------------------------
# -------------------------------------------
# Heidelberg, 24.Oktober 2013
# -------------------------------------------
# Vorsicht: Fehler, wenn duration>=1Stunde

# convert ambient_order.txt zu filenames_ambient.txt (nur einmal benutzt):
#for i in `cat ambient_order.txt | perl -e '{while(<>){if(m/\d+,\s+([\w\.]+)/){print "$1\n";}}}'`; do ~/goetz/apps/get_duration.pl $i; done | perl -e '$i=1; while(<>){chomp; if(m/.*\s+(.+)\s+\d\d:(\d\d):(\d\d.*\d*)/){$file=$1; $dur=($2*60000) + int(($3*1000)+0.99); print "$i $file, $file  $dur;\n"; ++$i} else {print "error ######## $_\n"}}'

# stereo-files (fuer ambient)
#for i in long*.aiff; do ~/goetz/apps/get_duration.pl $i; done | perl -e '$i=1; while(<>){chomp; if(m/.*\s+(.+)\s+\d\d:(\d\d):(\d\d.*\d*)/){$file=$1; $dur=($2*60000) + int(($3*1000)+0.99); print "$i $file, $file  $dur;\n"; ++$i} else {print "error ######## $_\n"}}'

# mono-files (fuer foreground)
#for i in short*.aiff; do ~/goetz/apps/get_duration.pl $i; done | perl -e '$i=1; while(<>){chomp; if(m/.*\s+(.+)\s+\d\d:(\d\d):(\d\d.*\d*)/){$file=$1; $dur=($2*60000)+int(($3*1000)+0.99); print "$i $file, $file  $dur;\n"; ++$i} else {print "error ######## $_\n"}}'


#---------------------------------------------
# Vorsicht: ab hier Fehler, wenn duration>=1Minute

# test
#for i in sinus_*.aif; do ~/goetz/apps/get_duration.pl $i; done | perl -e '$i=1; while(<>){chomp; if(m/.*\s+(.+)\s+\d\d:\d\d:(\d\d.\d+)/){$file=$1; if (m/.*ludger.*/) {$dur=5020} else {$dur=$2*1000}; print "$i $file, $file  $dur;\n"; ++$i} else {print "error ######## $_\n"}}'

# -------------------------------------------
# Maus-Fuehrung, 3.Oktober 2013
# -------------------------------------------

#for i in c*.aif; do ~/goetz/apps/get_duration.pl $i; done | perl -e '$i=1; while(<>){chomp; if(m/.*\s+(.+)\s+\d\d:\d\d:(\d\d.\d+)/){$file=$1; if (m/.*ludger.*/) {$dur=5020} else {$dur=$2*1000}; print "$i $file, $file  $dur;\n"; ++$i} else {print "error ######## $_\n"}}'

# -------------------------------------------
# Krems, Mai 2013:
# -------------------------------------------
# tanz-files (letzte version oben)


# dur=5200 fuer etude-files; index beginnt mit 1; pfad: zkm-macbook
#for i in ludger*aif noise_n0*wav; do ~/goetz/apps/get_duration.pl $i; done | perl -e '$i=1; while(<>){chomp; if(m/.*\s+(.+)\s+\d\d:\d\d:(\d\d.\d+)/){$file=$1; if (m/.*ludger.*/) {$dur=5020} else {$dur=$2*1000}; print "$i $file, $file  $dur;\n"; ++$i} else {print "error ######## $_\n"}}'

# dur=5200 fuer etude-files; index beginnt mit 1; pfad: altes macbook
#for i in ludger*aif noise_n0*wav; do ~/goetz/goetz/apps/get_duration.pl $i; done | perl -e '$i=1; while(<>){chomp; if(m/.*\s+(.+)\s+\d\d:\d\d:(\d\d.\d+)/){$file=$1; if (m/.*ludger.*/) {$dur=5020} else {$dur=$2*1000}; print "$i $file, $file  $dur;\n"; ++$i} else {print "error ######## $_\n"}}'

# duration fuer alle:
#for i in ludger*aif noise_n0*wav; do ~/goetz/goetz/apps/get_duration.pl $i; done | perl -e '$i=1; while(<>){chomp; if(m/.*\s+(.+)\s+\d\d:\d\d:(\d\d.\d+)/){$file=$1; $dur=$2*1000; print "$i, $file  $dur;\n"; ++$i}}'

# ohne duration:
#ls ludger_b* noise_n0* | perl -e '$i=1; while(<>){chomp; print "$i, $_;\n"; ++$i}'

# -------------------------------------------
# morse-files

# 
# duration fuer alle:
#for i in m1_*.wav gp_short_*.wav; do ~/goetz/goetz/apps/get_duration.pl $i; done | perl -e '$i=1; while(<>){chomp; if(m/.*\s+(.+)\s+\d\d:\d\d:(\d\d\.*\d*)/){$file=$1; $dur=$2*1000; print "$i, $file  $dur;\n"; ++$i} else {print "error ######## $_\n"}}'


# -------------------------------------------
