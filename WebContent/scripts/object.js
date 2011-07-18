var Guy = new Class(
        {
            initialize : function(gX, gY) {
                this.accel = 0; // Whether or not the ship is accelerating.
                this.xPos = gX;
                this.xSpeed = 0; // Added to xPos every update.
                this.yPos = gY;
                this.ySpeed = 0; // Added to yPos every update.

                this.scale = 1;
                this.isDead = false;

                this.goingHorizontal = 0;
                this.goingVertical = 0;

                this.disableTime = 0;

                this.xSize = 6;
                this.xOffset = -3;
                this.ySize = 12;
                this.yOffset = -12;

                this.health = this.maximumHealth = 1000;
                this.healthBar = $('playerHealth');

                this.electricCharge = 0; // Current energy charge
                this.electricChargeMax = 300; // Maximum charge
                this.lightningStrikeCharge = 0; // Current weapon charge
                this.lightningStrikeChargeMin = 25; // Minimum weapon charge
                // (fireing fails when
                // current charge below
                // this)
                this.lightningStrikeChargeMax = 300; // Maximum weapon charge
                // (charging stops at
                // this point)
                this.lightningImpact = 0; // How badly you'll rape the ground.

                this.chargeBar = $('electricCharge');
                this.lightningChargeBar = $('weaponCharge');
                this.minimumChargeBar = $('minimumCharge');

                this.moveBlurAmount = 10; // How detailed the blur is.
                this.moveBlurLength = 1; // How many xSpeeds and ySpeeds the
                // blur covers

                /*
                 * Prepare stats. Woo boy, this bit sure is complicated. Roll
                 * eyes.
                 */

                this.timeBeforeFirstBlood = 0;

                this.stats = new Array();
                this.stats['killTanks'] = 0;
                this.stats['spawnTanks'] = 0;

                this.stats['killPlanes'] = 0;
                this.stats['spawnPlanes'] = 0;
                this.stats["planeCrashes"] = 0;

                // Unused
                this.stats['killHealthy'] = 0; // Killed healthy with a shock.
                this.stats['wasteHealthy'] = 0; // Wasted healthy by bumping
                // into him.
                this.stats['salvageHealthy'] = 0; // Got some use from healthy
                // by shocking him after
                // wasting.

                this.stats['bulletsSpawned'] = 0; // Excludes orbital lasers,
                // depth charges (primary
                // stage), and healthy
                // bullets (maybe?).
                this.stats["depthChargesDropped"] = 0;
                this.stats["depthChargesDisarmed"] = 0;
                this.stats["damagePossible"] = 0; // Total damage possible,
                // excluding orbital lasers.
                // (Which would be a ton)

                // Unused
                this.stats['frameCount'] = 0; // Number of frames you played
                this.stats['hitWalls'] = 0; // Number of times you hit the walls

                // Unused
                this.stats['attacks'] = 0; // How many times you used your
                // attack
                this.stats['energyExpended'] = 0; // How much energy used to
                // make those attacks
                this.stats['failedAttacks'] = 0; // Number of times you tried
                // to attack but didn't due
                // to lack of energy.

                this.stats['healed'] = 0; // How much you've been healed,
                // excluding max health increases.
                this.stats['overHealed'] = 0; // How much you've been healed
                // beyond your max health.

                this.stats["bulletsContacted"] = 0;
                this.stats["damageTaken"] = 0;

                this.stats["healedTotal"] = 0; // Unused
                this.stats["healsWasted"] = 0; // Unused

                this.stats["orbitalStrikes"] = 0;
                this.stats["orbitalKillTanks"] = 0;
                this.stats["orbitalKillPlanes"] = 0;
                this.stats["orbitalKillBullets"] = 0;
                this.stats["orbitalKillHealthy"] = 0; // Unused

                this.quakeTime = 0;

            },
            quake : function() {
                /*
                 * On laser strike, the ground shakes. Unused because I like
                 * keeping my lunch.
                 */
                // this.quakeTime = 30;
            },
            handleQuake : function() {
                if (this.quakeTime != 0) {
                    if (this.quakeTime == 1) {
                        $('playField').style.top = 0 + "px";
                        $('playField').style.left = 0 + "px";
                    } else {
                        document.title = this.quakeTime;
                        $('playField').style.top = Math.round(2 * this.quakeTime * Math.random() - this.quakeTime)
                                + "px";
                        $('playField').style.left = Math.round(2 * this.quakeTime * Math.random() - this.quakeTime)
                                + "px";
                        this.quakeTime--;
                    }
                }
            },
            disable : function(howLong) {
                this.disableTime = Math.round(howLong / 30);
                this.electricCharge -= howLong / 10;
            },
            dealDamage : function(amount, type, forceX, forceY, forceScale) {
                if (!this.isDead) {
                    this.health -= amount;
                    if (this.health <= 0) {
                        this.die();

                        // Satellite
                        if (type == "orbital") {
                            type = "n orbital laser";
                        }
                        // Tank
                        if (type == "flak") {
                            type = " flak cannon";
                        }
                        if (type == "artillery") {
                            type = "n artillery cannon";
                        }
                        // Plane
                        if (type == "plane") {
                            type = " plane gun";
                        }
                        if (type == "cows") {
                            type = " plane crash";
                        }
                        if (type == "depth") {
                            type = " depth charge";
                        }
                        $('killedBy').innerHTML = type;
                    }
                }
                if (amount > 0) {
                    if (this.timeBeforeFirstBlood == 0) {
                        if (this.isDead) {
                            this.timeBeforeFirstBlood = accumulatedTime;
                        } else {
                            var timeyTheTimer = new Date();
                            this.timeBeforeFirstBlood = accumulatedTime + timeyTheTimer.getTime() - startTime;
                        }
                    }

                    this.stats["damageTaken"] += amount;
                    this.stats["bulletsContacted"]++;
                    this.xSpeed += forceX * amount / 15;
                    this.ySpeed += forceY * amount / 15;
                } else {
                    this.stats["healedTotal"] += amount;
                    if (this.health > this.maximumHealth) {
                        this.stats["healsWasted"] += this.health - this.maximumHealth;
                        this.health = this.maximumHealth;
                    }
                }
            },
            increaseMaxHealth : function(amount) {
                this.maximumHealth += amount;
                this.health += amount;
            },
            updateHealthBar : function() {
                if (!this.isDead) {
                    this.healthBar.style.width = (100 * (this.health / this.maximumHealth)) + "%";
                }
            },
            die : function() {
                this.health = 0;
                this.healthBar.style.width = 0 + "%";
                this.isDead = true;

                var timeyTheTimer = new Date();
                accumulatedTime += timeyTheTimer.getTime() - startTime;

                if (tier >= tierMax) {
                    maxTierAccumulatedTime += timeyTheTimer.getTime() - maxTierStartTime;
                }
            },
            drawSelf : function() {
                this.updateSelf();
                this.updateHealthBar();
                // Drawing
                context.save();
                context.translate(this.xPos, fHeight - this.yPos);

                context.strokeStyle = "rgb(255,255,55)";

                // Draw motion blur / tail
                if (this.lightningImpact > 0) {
                    this.moveBlurTemp = this.moveBlurAmount;
                    this.moveBlurAmount = Math.abs(Math.round(this.ySpeed / 10)) + 3;
                }

                for ( var i = this.moveBlurAmount; i > 0; i--) {
                    if (this.lightningImpact > 0) {
                        // These are olde, prolly won't work good anymore.
                        // ordinance.push(new
                        // DownwardAirShock(this.xPos-i*(this.xSpeed/this.moveBlurAmount),this.yPos-i*(this.ySpeed/this.moveBlurAmount),this.lightningImpact/10+((1/this.moveBlurAmount)*(this.moveBlurAmount-i))*2,0));
                        // Power Diamonds ordinance.push(new
                        // DownwardAirShock(this.xPos-i*(this.xSpeed/this.moveBlurAmount),this.yPos-i*(this.ySpeed/this.moveBlurAmount),this.lightningImpact/120+(i/this.moveBlurAmount)*(this.moveBlurAmount-i),0));
                        // ordinance.push(new
                        // DownwardAirShock(this.xPos-i*(this.xSpeed/this.moveBlurAmount),this.yPos-i*(this.ySpeed/this.moveBlurAmount),(1-i/50)+this.lightningImpact/120,this.moveBlurAmount-i));
                        ordinance.push(new DownwardAirShock(this.xPos - i * (this.xSpeed / this.moveBlurAmount),
                                this.yPos - i * (this.ySpeed / this.moveBlurAmount),
                                (this.lightningImpact - this.lightningStrikeChargeMin) / 6 + 12,
                                ((.15) / (this.moveBlurAmount)) * i));
                        if (true) {
                            context.restore();
                            ordinance[(ordinance.length - 1)].drawSelf();
                            context.save();
                            context.translate(this.xPos, fHeight - this.yPos);
                        }
                    }
                    /*
                     * var temp = (200-i*(200/this.moveBlurAmount));
                     * context.fillStyle = "rgb("+temp+","+temp+","+temp+")";
                     */
                    var temp = (1 - i * (1 / this.moveBlurAmount));
                    context.fillStyle = "rgba(255,255,0," + temp + ")";
                    context.fillRect(-3 - i * (this.moveBlurLength * this.xSpeed / this.moveBlurAmount), -12 + i
                            * (this.moveBlurLength * this.ySpeed / this.moveBlurAmount), 6, 12);
                }
                if (this.lightningImpact > 100) {
                    this.moveBlurAmount = this.moveBlurTemp;
                }

                // Draw the box thing
                context.fillStyle = "rgb(255,255,55)";
                context.fillRect(-3, -12, 6, 12);

                context.restore();
            },
            handleMovement : function() {
                // Made contact with ground
                if (this.yPos <= 0) {
                    if (this.ySpeed < 0) {
                        this.ySpeed *= -.5;
                    } else {
                        this.ySpeed *= .5;
                    }
                    if (this.ySpeed > 0 && this.ySpeed < 1) {
                        this.ySpeed = 0;
                    }
                    this.yPos = 0;
                    this.xSpeed *= .9;

                    if (this.lightningImpact > 0) {
                        this.lightningStruck();
                        this.lightningImpact = 0;
                        this.ySpeed *= .2;
                    }
                } else {

                    // Gravity
                    this.ySpeed -= .5;

                    if (this.yPos >= fHeight - 40 && this.ySpeed > 0) {
                        this.ySpeed *= .85;
                        this.ySpeed -= 2;
                    }

                    // In flight friction
                    this.ySpeed *= .99;
                    this.xSpeed *= .99;
                }

                // Made contact with sides of playfield.
                if (this.xPos <= 0 || this.xPos >= fWidth) {
                    // (commented out) Bounce off the walls.

                    if (this.xSpeed < 0) {
                        this.xPos = 5;
                    } else {
                        this.xPos = -5 + fWidth;
                    }
                    this.xSpeed *= -0.25;

                    // Loop around
                    // this.xPos *= -1;
                    /*
                     * if(this.xPos > fWidth/2){ this.xPos -= fWidth; } else {
                     * this.xPos += fWidth; }
                     */
                }

                // Acceleration
                if (!this.isDead && this.disableTime <= 0) {
                    if (this.goingVertical != 0 && this.lightningImpact == 0 && !(this.yPos >= fHeight - 55)) {
                        this.ySpeed += this.goingVertical * 1.5;
                    }
                    if (this.goingHorizontal != 0) {
                        this.xSpeed += this.goingHorizontal * 1;
                    }
                }
                this.xPos += this.xSpeed;
                this.yPos += this.ySpeed;
            },
            handleWeaponCharging : function() {
                // Charging mah cannon (Weapons being charged)
                if (this.chargingMahCannon && !this.isDead && this.disableTime <= 0) {
                    // if(this.lightningStrikeCharge <
                    // this.lightningStrikeChargeMax){
                    this.lightningStrikeCharge += 3;
                    if (this.lightningStrikeCharge > this.lightningStrikeChargeMax) {
                        this.lightningStrikeCharge = this.lightningStrikeChargeMax;
                    }
                    if (this.lightningStrikeCharge > this.electricCharge) {
                        this.lightningStrikeCharge = this.electricCharge;
                    }
                    // Update the progress bars.
                    this.lightningChargeBar.style.width = 100 * (this.lightningStrikeCharge / this.electricChargeMax)
                            + "%";
                    this.minimumChargeBar.style.width = 100 * (this.lightningStrikeChargeMin / this.electricChargeMax)
                            + "%";
                    this.minimumChargeBar.style.opacity = this.lightningStrikeCharge * .1;
                    // }
                } else {
                    if (this.lightningStrikeCharge > 0) {
                        // Discharge weapon charge, reset the progress bars.
                        this.lightningStrikeCharge = 0;
                        this.lightningChargeBar.style.width = 100
                                * (this.lightningStrikeCharge / this.electricChargeMax) + "%";
                        this.minimumChargeBar.style.opacity = 0;
                    }
                }
            },
            updateSelf : function() {
                this.handleMovement();
                this.handleWeaponCharging();
                this.handleQuake();

                if (this.disableTime > 0) {
                    this.disableTime--;
                }

                // Passive energy charges / discharges
                if (this.yPos <= 0) {
                    // You're grounded, electricity drains while grounded.
                    this.electricCharge -= 2;

                    if (this.electricCharge < 0) {
                        this.electricCharge = 0;
                    }
                } else {
                    if (this.isDead) {
                        this.electricCharge += 4 * (this.yPos / fHeight) - 4;
                    } else {
                        this.electricCharge += 4 * (this.yPos / fHeight) - 1;
                    }
                    // this.electricCharge++;
                    if (this.electricCharge > this.electricChargeMax) {
                        this.electricCharge = this.electricChargeMax;
                    }
                }
                this.chargeBar.style.width = 100 * (this.electricCharge / this.electricChargeMax) + "%";

            },
            goHorizontal : function(amount) {
                if (this.goingHorizontal == 0 || amount == 0) {
                    this.goingHorizontal = amount;
                }
            },
            goVertical : function(amount) {
                if (this.goingVertical == 0 || amount == 0) {
                    this.goingVertical = amount;
                }
            },
            initiateLightningCharge : function() {
                this.chargingMahCannon = true;
            },
            lightningStrike : function() {
                this.chargingMahCannon = false;
                if (this.lightningStrikeCharge > this.lightningStrikeChargeMin) {
                    if (this.yPos > 150) {
                        this.electricCharge -= this.lightningStrikeCharge;
                        this.lightningImpact = this.lightningStrikeCharge;
                        this.ySpeed = (0 - this.lightningStrikeCharge) / 2 - 50;
                    }
                }
            },
            lightningStruck : function() {
                ordinance.push(new GroundShock(this.xPos, this.yPos, (this.lightningImpact / 2 + 10)));
                this.lightningImpact = 0;
            },
            lightningShield : function() {
                return;
            }
        });
var DownwardAirShock = new Class({
    initialize : function(x, y, spread, opacityOffset) {
        this.xPos = x;
        this.yPos = y;
        this.spread = this.originalSpread = spread; // How far in either
        // direction the
        // shockwave goes.

        this.shouldExist = true;
        this.isVolatile = true;
        this.isInvulnerable = true;

        this.alpha = 1;
        this.alpha -= opacityOffset;
    },
    updateSelf : function() {
        this.alpha -= .15;
        this.spread = this.originalSpread * this.alpha;
        if (this.alpha < .5) {
            // this.isVolatile = false;
        }
        if (this.alpha <= 0.01) {
            this.shouldExist = false;
        }
    },
    drawSelf : function() {
        this.updateSelf();
        this.DESTROYDESTROYDESTROY();

        if (this.shouldExist) {
            context.save();
            context.translate(this.xPos, fHeight - this.yPos);

            context.strokeStyle = "rgba(255,255,255," + this.alpha + ")";

            context.beginPath();
            context.lineWidth = 1;
            context.moveTo(-1 * this.spread, -5);
            context.lineTo(0, 0);
            context.lineTo(1 * this.spread, -5);

            context.stroke();

            context.restore();
        }
    },
    DESTROYDESTROYDESTROY : function() {
        if (this.isVolatile) {
            // if(enemies[i].distanceFrom(this.xPos) < (this.spread+10)
            // && Math.abs(enemies[i].yPos - this.yPos) <
            // (this.spread+5) ){

            if (healthy.isCloseTo(this.xPos, this.yPos, this.spread + 12, 14)) {
                healthy.triggerHealthGive();
            }
            for ( var i = 0; i < enemies.length; i++) {
                if (!enemies[i].isInvulnerable && enemies[i].distanceFrom(this.xPos) < (this.spread + 10)
                        && Math.abs(enemies[i].yPos - this.yPos) < (this.spread + 5)) {
                    // enemies[i].shouldExist = false;
                    enemies[i].die();
                }
            }
        }
    }
});
var GroundShock = new Class({
    initialize : function(x, y, spread) {
        this.xPos = x;
        this.yPos = y;
        this.spread = spread * 1 + 50; // How far in either direction the
        // shockwave goes.

        this.shouldExist = true;
        this.isVolatile = true;
        this.isInvulnerable = true;

        this.ringGrowthSpeed = spread / 10 + 10;
        this.ringSize = 0;
        this.rings = new Array();
        this.ringOffset = 0;
        this.maxRings = 10;
        this.alpha = 1;
    },
    updateSelf : function() {
        // this.ringSize += this.ringGrowthSpeed;
        this.ringSize += 10;

        // this.ringGrowthSpeed += .1;
        if (this.ringSize >= this.spread) {
            // this.isVolatile = false;
            this.ringSize = this.spread;
            this.rings.splice(0, 1);
            // this.ringOffset++;
            if (this.rings.length <= 0) {
                this.shouldExist = false;
            }
        } else {
            if (Math.round(this.ringSize) % 10 == 0) {
                this.rings.push(this.ringSize);
            }
            if (this.rings.length >= this.maxRings) {
                this.rings.splice(0, 1);
            }
        }
    },
    DESTROYDESTROYDESTROY : function() {
        if (this.isVolatile) {
            for ( var i = 0; i < enemies.length; i++) {
                if (!enemies[i].isInvulnerable && enemies[i].yPos <= 0
                        && enemies[i].distanceFrom(this.xPos) < this.ringSize) {
                    // enemies[i].shouldExist = false;
                    enemies[i].die();
                }
            }
        }
    },
    drawSelf : function() {
        this.updateSelf();
        this.DESTROYDESTROYDESTROY();
        if (this.ringSize > 0) {
            context.lineWidth = 3;
            for ( var i = 0; i < this.rings.length; i++) {
                context.strokeStyle = "rgba(255,255,255,"
                        + ((i) / (this.maxRings) - (this.ringOffset) / (this.maxRings)) + ")";
                context.beginPath();
                context.arc(this.xPos, fHeight - this.yPos, (this.rings[i]), (350) * (Math.PI / 180),
                        360 * (Math.PI / 180), false);
                context.stroke();

                context.beginPath();
                context.arc(this.xPos, fHeight - this.yPos, (this.rings[i]), 180 * (Math.PI / 180),
                        (190) * (Math.PI / 180), false);
                context.stroke();
            }
        }

    }
});

var Tank = new Class({
    initialize : function(tier, fromSide) {
        player.stats['spawnTanks']++;

        this.xPos = (fWidth / 2) + fromSide * ((fWidth / 2) + 50);
        this.yPos = 0;
        this.xSpeed = -3 * fromSide;

        this.isInvulnerable = false;

        this.usesPEW = false;
        if (tier >= 6) {
            random = Math.random();
            if (tier == 6 && random < .2) {
                this.usesPEW = true;
            }
            if (tier == 7 && random < .4) {
                this.usesPEW = true;
            }
            if (tier >= 8 && random < .6) {
                this.usesPEW = true;
            }
        }
        if (tier == 12 && Math.random() < .5 || true) {
            // this.usesDrainy = true;
        }

        this.weaponSpeed = 18;
        this.reloadCount = 0;
        this.reloadDelay = 180;
        this.salvoReset = 5;
        this.salvoCount = this.salvoReset;
        this.salvoDelay = 4;

        if (this.usesPEW) {
            this.weaponSpeed = 25;
            this.salvoDelay = 0;
            this.salvoReset = 25;
            this.salvoCount = this.salvoReset;
            this.reloadDelay = 90;
        }

        this.shouldExist = true;
    },
    die : function(killedBy) {
        if (this.shouldExist) {
            enemies.push(new Explosion(this.xPos, this.yPos, 40));
            this.shouldExist = false;
            if (killedBy != "orbital") {
                player.stats['killTanks']++;
            } else {
                player.stats['orbitalKillTanks']++;
            }
        }
    },
    handleWeapons : function() {
        this.reloadCount--;
        if (this.reloadCount <= 0) {
            if (this.salvoCount == 0) {
                this.reloadCount = this.reloadDelay;
                this.salvoCount = this.salvoReset;
            } else {
                angleTemp = this.angleToPlayer();
                while (this.salvoCount != 0) {
                    this.salvoCount--;
                    this.reloadCount += this.salvoDelay;
                    // Bullet.initialize:
                    // function(x,y,heading,speed,scale,damage,seaks,gravityMultiplier,inAccuracy){
                    if (this.usesDrainy) {
                        // this.salvoCount = 0;
                        ordinance.push(new Bullet(this.xPos, this.yPos, angleTemp, 8 * Math.random() + 25, 3, 750, 0,
                                0, this.salvoCount / 4, "drain"));
                    } else if (this.usesPEW) {
                        ordinance.push(new Bullet(this.xPos, this.yPos, angleTemp, 8 * Math.random() + 25, .1, 1, 0, 0,
                                this.salvoCount / 4, "flak"));
                    } else {
                        ordinance.push(new Bullet(this.xPos, this.yPos, this.angleToPlayer(), 18, 1, 8, 0, 1, 5,
                                "artillery"));
                    }
                    if (this.salvoDelay != 0) {
                        break;
                    }
                }
            }
        }
    },
    angleToPlayer : function() {
        angle = Math.atan2(player.xPos - this.xPos, player.yPos - this.yPos);
        // Recalculate angle, with some prediction.
        if (true) {
            xOffset = .8 * player.xSpeed * ((player.yPos - this.yPos) / (Math.cos(angle) * this.weaponSpeed));
            angle = Math.atan2(player.xPos - this.xPos + xOffset, player.yPos - this.yPos);
        }
        return angle;
    },
    distanceFrom : function(x, y) {
        if (!$chk(x)) {
            return Math.abs(this.yPos - y);
        } else if (!$chk(y)) {
            return Math.abs(this.xPos - x);
        } else {
            return Math.sqrt(Math.pow(this.xPos - x, 2) + Math.pow(this.yPos - y, 2));
        }
    },
    isCloseTo : function(x, y, howClose) {
        if (Math.abs(this.xPos - x) < howClose) {
            return true;
        } else {
            return false;
        }
    },
    distanceFromGroundedX : function() {
        return Math.abs(player.xPos - this.xPos);
    },
    updateSelf : function() {
        if (!player.isDead) {
            this.handleWeapons();
        }
        this.xPos += this.xSpeed;
    },
    drawSelf : function() {
        if ((this.xPos < 0 && this.xSpeed < 0) || (this.xPos > fWidth && this.xSpeed > 0)) {
            this.shouldExist = false;
        }
        this.updateSelf();
        // Drawing
        context.save();
        context.translate(this.xPos, fHeight - this.yPos);

        // Draw the box thing
        context.fillStyle = "rgb(255,255,255)";
        // this.temp =
        // "rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")";

        // context.fillStyle = this.temp;
        context.fillRect(-12, -8, 24, 8);

        context.restore();
    }
});

var Plane = new Class({
    initialize : function(notTier, fromSide) {
        player.stats['spawnPlanes']++;
        this.xPos = (fWidth / 2) + fromSide * ((fWidth / 2) + 50);
        this.yPos = (8 * fHeight / 10) * Math.random() + (1.5 * fHeight / 10);
        this.speed = 15;
        this.xSpeed = -1 * this.speed * fromSide;
        this.ySpeed = 0;
        if (fromSide < 0) {
            this.heading = Math.PI / 2;
        } else {
            this.heading = -Math.PI / 2;
        }

        this.isInvulnerable = false;

        this.reloadCount = -20 - 20 * Math.random();
        this.reloadDelay = 60;
        /* Adjust ammo for tier advances */
        if (tier <= 2) {
            this.salvoReset = 6;
        } else if (tier == 3) {
            this.salvoReset = 9;
        } else {
            this.salvoReset = 12;
        }
        this.salvoCount = this.salvoReset;
        this.salvoDelay = 1;

        // Figure out if the plane should execute a loop, when, and in
        // which direction.
        if (tier >= 3 && Math.random() > .6) {
            this.doesLoop = Math.round(.75 * Math.random() * (fWidth / this.speed) + 12);
            this.loopDirection = -1 * fromSide;
            if (this.yPos < (fHeight / 2)) {
                this.loopDirection = 1 * fromSide;
            }
        } else {
            this.doesLoop = -1;
        }
        this.loopTime = 0;

        // Enable depth charges when tier hits 9, and increae ammo
        // counts for appropriate tiers.
        this.usesDepthCharges = false;
        if (tier >= 9) {
            this.usesDepthCharges = true;
        }
        if (this.usesDepthCharges) {
            this.depthChargeCount = 3;
            this.depthChargeDelay = 10 + Math.round(Math.random() * 25);
            this.depthChargeSalvoReset = 10;
            this.depthChargeSalvoDelay = 4;
        }
        if (tier == 9) {
            this.depthChargeCount = 1;
        }
        if (tier == 10) {
            this.depthChargeCount = 2;
        }

        this.shouldExist = true;
        this.weaponSpeed = 30;
    },
    die : function(killedBy) {
        if (this.shouldExist) {
            enemies.push(new Explosion(this.xPos, this.yPos, 40));

            this.shouldExist = false;
            if (killedBy != "orbital") {
                player.stats['killPlanes']++;
            } else {
                player.stats['orbitalKillPlanes']++;
            }
        }
    },
    handleWeapons : function() {
        if (this.usesDepthCharges && this.depthChargeDelay >= 0) {
            if (this.depthChargeDelay > 0) {
                this.depthChargeDelay--;
            } else {
                if (this.depthChargeCount > 0) {
                    this.depthChargeDelay = this.depthChargeSalvoDelay;
                    this.depthChargeCount--;
                    player.stats["depthChargesDropped"]++;
                    enemies.push(new DepthCharge(this.xPos, this.yPos, 15, 1));
                } else {
                    this.depthChargeDelay--;
                }
            }

        }
        this.reloadCount--;
        if (this.reloadCount <= 0) {
            if (this.salvoCount == 0) {
                this.reloadCount = this.reloadDelay;
                this.salvoCount = this.salvoReset;
            } else {
                this.salvoCount--;
                this.reloadCount += this.salvoDelay;
                ordinance.push(new Bullet(this.xPos, this.yPos, this.angleToPlayer(), this.weaponSpeed, .5, 2, 0, 1, 5,
                        "plane"));
            }
        }
    },
    angleToPlayer : function() {
        angle = Math.atan2(player.xPos - this.xPos, player.yPos - this.yPos);
        // Recalculate angle, with some prediction.
        if (true) {
            xOffset = .8 * player.xSpeed * ((player.yPos - this.yPos) / (Math.cos(angle) * this.weaponSpeed));
            angle = Math.atan2(player.xPos - this.xPos + xOffset, player.yPos - this.yPos);
        }
        return angle;
    },
    distanceFrom : function(x, y) {
        if (!$chk(x)) {
            return Math.abs(this.yPos - y);
        } else if (!$chk(y)) {
            return Math.abs(this.xPos - x);
        } else {
            return Math.sqrt(Math.pow(this.xPos - x, 2) + Math.pow(this.yPos - y, 2));
        }
    },
    isCloseTo : function(x, y, xClose, yClose) {
        if (Math.abs(this.xPos - x) < xClose + 8 && Math.abs(this.yPos - y) < yClose + 4) {
            return true;
        } else {
            return false;
        }
    },
    distanceFromGroundedX : function() {
        return Math.abs(player.xPos - this.xPos);
    },
    updateSelf : function() {
        if (!player.isDead) {
            this.handleWeapons();
        }
        if (player.lightningImpact == 0
                && this.isCloseTo(player.xPos, player.yPos - player.yOffset / 2, player.xSize / 2, player.ySize / 2)) {

            this.die();
            player.stats["planeCrashes"]++;
            player.dealDamage(20, "cows", this.xSpeed, this.ySpeed, 1);
        }
        this.handleAirobatics();

        this.xPos += this.xSpeed;
        this.yPos += this.ySpeed;
    },
    handleAirobatics : function() {
        if (this.doesLoop >= 0) {
            if (this.doesLoop == 0) {
                this.heading += (Math.PI / 180) * 5 * this.loopDirection;
                this.loopTime++;
                if (this.loopTime >= 72) {
                    this.doesLoop--;
                }

                this.xSpeed = Math.sin(this.heading) * this.speed;
                this.ySpeed = Math.cos(this.heading) * this.speed;
            } else {
                this.doesLoop--;
            }
        }
    },
    drawSelf : function() {
        if ((this.xPos < 0 && this.xSpeed < 0) || (this.xPos > fWidth && this.xSpeed > 0)) {
            if (this.doesLoop <= -1) {
                this.shouldExist = false;
            }
        }
        this.updateSelf();
        // Drawing
        context.save();
        context.translate(this.xPos, fHeight - this.yPos);

        // Draw the box thing
        context.fillStyle = "rgb(255,255,255)";
        // this.temp =
        // "rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")";
        // context.fillStyle = this.temp;
        // context.fillRect(-12,-8,24,8);

        if (this.xSpeed < 0) {
            // context.rotate(Math.PI);
        }

        context.rotate(this.heading);

        context.beginPath();
        context.moveTo(0, -10);
        context.lineTo(5, 14);
        context.lineTo(0, 8);
        context.lineTo(-5, 14);
        context.lineTo(0, -10);
        /*
         * context.moveTo(10,0); context.lineTo(-14,5); context.lineTo(-8,0);
         * context.lineTo(-14,-5); context.lineTo(10,0);
         */
        context.fill();

        context.restore();
    }
});

var MeteorStorm = new Class({
    initialize : function() {
        this.heading = Math.random() * (Math.PI / 4) + Math.PI;
        this.rotationSpeed = Math.random() * Math.PI / 50 - Math.PI / 100;
        this.xPos = this.yPos = 0;
        this.shouldExist = true;
        this.isInvulnerable = true;
    },
    die : function(byWhat) {
        this.shouldExist = false;
    },
    spawnStuff : function() {
        damageScale = Math.random();
        if (Math.sin(this.heading) > 0) {
            ordinance.push(new Bullet(0, fHeight * Math.random(), this.heading, 20 + 10 * damageScale, 1 + damageScale,
                    5 + 5 * damageScale, 0, 1, 0, "meteor"));
        } else {
            ordinance.push(new Bullet(fWidth, fHeight * Math.random(), this.heading, 20 + 10 * damageScale,
                    1 + damageScale, 5 + 5 * damageScale, 0, 1, 0, "meteor"));
        }

        if (Math.cos(this.heading) > 0) {
            ordinance.push(new Bullet(fWidth * Math.random(), 0, this.heading, 20 + 10 * damageScale, 1 + damageScale,
                    5 + 5 * damageScale, 0, 1, 0, "meteor"));
        } else {
            ordinance.push(new Bullet(fWidth * Math.random(), fHeight, this.heading, 20 + 10 * damageScale,
                    1 + damageScale, 5 + 5 * damageScale, 0, 1, 0, "meteor"));
        }
        /*
         * for(i = 0; i < 1; i++){ //Bullet.initialize:
         * function(x,y,heading,speed,scale,damage,seaks,gravityMultiplier,inAccuracy,type){
         * damageScale = Math.random(); if(this.heading > Math.PI/2 &&
         * this.heading < 3*Math.PI/2){ ordinance.push(new
         * Bullet(fWidth*Math.random(),fHeight,this.heading,20+10*damageScale,1+damageScale,5+5*damageScale,0,1,0,"meteor")); }
         * else { ordinance.push(new
         * Bullet(fWidth*Math.random(),0,this.heading,20+10*damageScale,1+damageScale,5+5*damageScale,0,1,0,"meteor")); } }
         */
    },
    updateSelf : function() {
        if (tier % 2 != 0) {
            // this.die();
        }
        if (!player.isDead) {
            this.spawnStuff();
        }

        if (this.heading < 0 - Math.PI) {
            this.heading += Math.PI * 2;
        } else if (this.heading > Math.PI) {
            this.heading -= Math.PI * 2;
        }
        this.heading += this.rotationSpeed;
    },
    drawSelf : function() {
        this.updateSelf();
    }
});

var Explosion = new Class({
    initialize : function(x, y, size) {
        this.xPos = x;
        this.yPos = y;
        this.scale = size;

        this.opacity = 1;

        this.isInvulnerable = true;
        this.shouldExist = true;
    },
    die : function() {

    },
    drawSelf : function() {
        this.opacity *= .85;
        if (this.opacity <= .01) {
            this.shouldExist = false;
        }

        if (this.shouldExist) {
            // createRadialGradient(x1,y1,r1,x2,y2,r2)
            this.radialGradient = context.createRadialGradient(this.xPos, fHeight - this.yPos, 0, this.xPos, fHeight
                    - this.yPos, this.scale);
            this.radialGradient.addColorStop(0, 'rgba(255,255,255,' + this.opacity + ')');
            this.radialGradient.addColorStop(1, 'rgba(0,0,0,0)');

            context.fillStyle = this.radialGradient;

            context.fillRect(this.xPos - this.scale, fHeight - this.yPos - this.scale, this.scale * 2, this.scale * 2);

        }
    }
});

var Satellite = new Class({
    initialize : function(fromSide) {
        this.xPos = Math.random() * fWidth;
        this.yPos = fHeight * 2;
        // this.speed = 10;
        this.speed = fWidth / 100;
        // 144 frames to travel a 1440 wide display
        this.xSpeed = -1 * this.speed * fromSide;
        this.ySpeed = 0;

        this.isInvulnerable = true;
        this.shouldExist = true;

        if (cheatToTier >= tierMax) {
            this.reloadCount = (tierMax - tier) * 25 + 10 * Math.random();
        } else {
            this.reloadCount = 10 + 40 * Math.random();
        }
        this.reloadDelay = 150; // 5 second refire rate.
    },
    updateSelf : function() {
        this.xPos += this.xSpeed;
        if (this.xPos > fWidth) {
            this.xPos -= fWidth;
        }

        if (this.reloadCount++ >= this.reloadDelay) {
            this.reloadCount = 10 + 40 * Math.random();
            if (!player.isDead) {
                this.fireLaser();
            }
        }
    },
    fireLaser : function() {
        ordinance.push(new OrbitalLaser(this.xPos));
    },
    drawSelf : function() {
        this.updateSelf();
        // No point in drawing anything!
    }
});

var OrbitalLaser = new Class({
    initialize : function(x) {
        player.stats["orbitalStrikes"]++;
        this.xPos = x;
        this.isInvulnerable = true;
        this.shouldExist = true;
        this.isVolatile = true;

        this.range = this.originalRange = 90;

        this.stage = 0;
        this.advanceStageIn = 50;
        this.opacity = 0;

        this.laserStage = 15;

        // createRadialGradient(x1,y1,r1,x2,y2,r2)

    },
    isCloseTo : function(x) {
        if (Math.abs(this.xPos - x) < this.range) {
            return true;
        }
        return false;
    },
    killEverything : function() {

        // ordinance.push(new
        // Bullet(this.xPos-this.range,0,7*Math.PI/4,Math.random()*4+7,.8,5,0,0,90));
        // ordinance.push(new
        // Bullet(this.xPos+this.range,0,Math.PI/4,Math.random()*4+7,.8,5,0,0,90));

        // ordinance.push(new Explosion(this.xPos-this.range-2,0,15));
        // ordinance.push(new Explosion(this.xPos+this.range+2,0,15));

        for ( var i = 0; i < enemies.length; i++) {
            if (this.isCloseTo(enemies[i].xPos) && !enemies[i].isInvulnerable) {
                enemies[i].die("orbital");
            }
        }
        for ( var i = 0; i < ordinance.length; i++) {
            if (this.isCloseTo(ordinance[i].xPos) && !ordinance[i].isInvulnerable) {
                try {
                    ordinance[i].die("orbital");
                } catch (err) {

                }
            }
        }
        if (this.isCloseTo(player.xPos)) {
            // player.die();
            if (!player.isDead) {
                enemies.push(new Explosion(player.xPos, player.yPos, 150));
            } else {
                enemies.push(new Explosion(player.xPos, player.yPos, 10));
            }
            if (player.xPos < this.xPos) {
                player.dealDamage(player.health, "orbital", -8, -2, 1);
                player.dealDamage(30, "orbital", -4, -6, 1);
            } else {
                player.dealDamage(player.health, "orbital", 8, -2, 1);
                player.dealDamage(30, "orbital", 4, -6, 1);
            }
        }

        if (this.isCloseTo(healthy.xPos)) {
            healthy.die("orbital");
        }
    },
    updateSelf : function() {
        if (this.stage == 0) {
            this.opacity += .03;
            if (this.opacity >= 1) {
                this.stage++;
                this.opacity = 1;
            }
        } else if (this.stage > 0 && this.stage < this.laserStage) {
            this.stage++;
            if (this.stage == this.laserStage) {
                player.quake();
                enemies.push(new Explosion(this.xPos, 0, 250));
            }
        } else {
            if (this.isVolatile) {
                this.killEverything();
            }
            this.range *= .95;
            if (this.range <= 0.1) {
                this.shouldExist = false;
            }

            if (this.range / this.originalRange < .2) {
                this.opacity *= .9;
                this.isVolatile = false;
            }

            if (this.range <= 8) {
            }
        }
    },
    drawSelf : function() {
        this.updateSelf();
        context.save();
        if (true) {
            this.radialGradient = context.createRadialGradient(this.xPos, 0, 0, this.xPos, -100, 220);
            this.radialGradient.addColorStop(0, 'rgba(255,255,255,' + this.opacity + ')');
            this.radialGradient.addColorStop(1, 'rgba(0,0,0,0)');
            context.fillStyle = this.radialGradient;
        } else {
            context.fillStyle = 'rgba(255,255,255,' + this.opacity + ')';
        }
        context.fillRect(this.xPos - this.range * 2, 0, this.range * 4, 200);

        if (this.stage == this.laserStage) {
            if (gradientLasers) {
                laserGradient = context.createLinearGradient(this.xPos - this.range, 0, this.xPos + this.range, 0);
                laserGradient.addColorStop(0, 'rgba(0,0,0,0)');
                laserGradient.addColorStop(.05, 'rgba(255,255,255,' + (.8 * this.opacity) + ')');
                laserGradient.addColorStop(.5, 'rgba(255,255,255,' + (1 * this.opacity) + ')');
                laserGradient.addColorStop(.95, 'rgba(255,255,255,' + (.8 * this.opacity) + ')');
                laserGradient.addColorStop(1, 'rgba(0,0,0,0)');
                context.fillStyle = laserGradient;
            } else {
                context.fillStyle = "rgba(255,255,255," + this.opacity + ")";
            }

            context.fillRect(this.xPos - this.range, 0, this.range * 2, fHeight);
        }
        context.restore();
    }
});

var Bullet = new Class({
    initialize : function(x, y, heading, speed, scale, damage, seaks, gravityMultiplier, inAccuracy, type) {
        // playSound();
        player.stats['damagePossible'] += damage;
        player.stats['bulletsSpawned']++;
        heading += (Math.PI / 180) * (inAccuracy * Math.random() - (inAccuracy / 2));
        this.xPos = x;
        this.xSpeed = Math.sin(heading) * speed;
        // this.xSpeed = 0;

        this.isInvulnerable = false;

        this.yPos = y;
        this.ySpeed = Math.cos(heading) * speed + 3;
        // this.ySpeed = 18;
        this.typeName = type;
        this.scale = scale;
        this.damage = damage; // Damage bullet deals
        if (seaks >= 0) {
            this.seaks = seaks * (Math.PI / 180);
        } else {
            this.seaks = 0;
        }
        if (this.seaks > 0) {
            this.heading = heading;
            this.speed = speed;
            this.seakTime = Math.round(Math.random() * 50 + 20);
        }

        this.shouldExist = true;

        // this.temp =
        // "rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")";
        this.temp = "white";
    },
    die : function(killedBy) {
        if (this.shouldExist) {
            this.shouldExist = false;
            enemies.push(new Explosion(this.xPos, this.yPos, 10 + 10 * this.scale));
            if (killedBy != "orbital") {

            } else {
                player.stats['orbitalKillBullets']++;
            }
        }
    },
    angleToPlayer : function() {
        return Math.atan2(player.xPos - this.xPos, player.yPos - this.yPos);
    },
    updateSelf : function() {
        if (this.shouldExist) {
            this.xPos += this.xSpeed;
            this.yPos += this.ySpeed;
            this.ySpeed -= .2;

            if (this.seaks > 0 && this.seakTime > 0) {
                if (player.isDead) {
                    this.seakTime = 0;
                }
                var headToAngle = this.angleToPlayer();
                if (this.heading < 0 - Math.PI) {
                    this.heading += Math.PI * 2;
                } else if (this.heading > Math.PI) {
                    this.heading -= Math.PI * 2;
                }
                if (this.heading < headToAngle) {
                    if (Math.abs(this.heading - headToAngle) < Math.PI) {
                        this.heading += this.seaks;
                    } else {
                        this.heading -= this.seaks;
                    }
                } else {
                    if (Math.abs(this.heading - headToAngle) < Math.PI) {
                        this.heading -= this.seaks;
                    } else {
                        this.heading += this.seaks;
                    }
                }

                if (Math.abs(this.heading - headToAngle) < this.seaks) {
                    this.heading = headToAngle;
                }

                this.seakTime--;
                this.xSpeed = Math.sin(this.heading) * this.speed;
                this.ySpeed = Math.cos(this.heading) * this.speed;
            }

            this.handleOffscreenisms();

            // Checks twice, once at current location, then at half way between
            // current location and last location
            if (player.lightningImpact <= 0) {
                if (this.isCloseTo(player.xPos, player.yPos - player.yOffset / 2, player.xSize / 2, player.ySize / 2)
                        || this.isCloseTo(player.xPos + this.xSpeed / 2, player.yPos - player.yOffset / 2 + this.ySpeed
                                / 2, player.xSize / 2, player.ySize / 2)) {
                    if (this.typeName != "drain") {
                        player.dealDamage(this.damage, this.typeName, this.xSpeed, this.ySpeed);
                    } else {
                        player.disable(this.damage);
                    }
                    this.die();
                }
            }
        }
    },
    handleOffscreenisms : function() {
        if (this.xPos < 0 && this.xSpeed < 0 || this.xPos > fWidth && this.xSpeed > 0) {
            this.shouldExist = false;
        }
        if (this.yPos < 0 || this.yPos > fHeight || this.resistance <= 0) {
            this.shouldExist = false;
        }
    },
    isCloseTo : function(x, y, xClose, yClose) {
        if (Math.abs(this.xPos - x) < xClose + 4 && Math.abs(this.yPos - y) < yClose + 4) {
            return true;
        } else {
            return false;
        }

    },
    drawSelf : function() {
        this.updateSelf();
        // Drawing
        context.save();
        context.translate(this.xPos, fHeight - this.yPos);

        // Draw some movement blur so it doesn't look like ass while moving
        // quickly
        moveGradient = context.createLinearGradient(0, 0, 0 - this.xSpeed, this.ySpeed);
        moveGradient.addColorStop(0, 'white');
        moveGradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.strokeStyle = moveGradient;

        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(0 - this.xSpeed, this.ySpeed);
        context.lineWidth = 4 * this.scale;
        context.stroke();

        // Draw the box thing
        context.fillStyle = "rgb(255,255,255)";
        context.fillRect(-2 * this.scale, -2 * this.scale, 4 * this.scale, 4 * this.scale);

        context.restore();
    }
});

var HealthCapsule = new Class({
    initialize : function(tier, fromSide) {
        this.speed = 7;
        this.xPos = (fWidth / 2) + fromSide * ((fWidth / 2) + 50);
        this.xSpeed = -1 * this.speed * fromSide;
        this.yPos = (5 * fHeight / 10) * Math.random() + (4 * fHeight / 10);
        this.ySpeed = 0;

        this.scale = 1;

        this.alpha = 1;
        this.lowerAlpha = .2;
        this.alphaGoing = .1;
        this.coloring = 0;

        this.shieldRotation = 0;

        this.shouldExist = true;
        this.hasProtection = true; // Remember kids, always use protection! You
        // don't want to get the AIDS!
    },
    updateAlpha : function() {
        this.alpha += this.alphaGoing;
        if (this.alpha <= this.lowerAlpha && this.alphaGoing < 0 || this.alpha >= 1 && this.alphaGoing > 0) {
            this.alphaGoing *= -1;
        }
        this.coloring = Math.round(255 * this.alpha);
    },
    updateSelf : function() {
        this.updateAlpha();
        this.handleExisting();
        if (!this.hasProtection) {
            this.ySpeed -= .5;
            this.scale -= .05;
            if (this.scale <= 0) {
                if (this.shouldSpawnBullets) {
                    player.increaseMaxHealth(5);
                }
                this.shouldExist = false;
                this.shouldSpawnBullets = false;
            }
        }

        if (this.isCloseTo(player.xPos, player.yPos, 14, 14)) {
            if (this.hasProtection) {
                this.hasProtection = false;
            }
        }

        this.xPos += this.xSpeed;
        this.yPos += this.ySpeed;
    },
    die : function(killedBy) {
        if (this.hasProtection) {
            this.hasProtection = false;
            if (killedBy != "orbital") {
                // player.stats["depthChargesDisarmed"]++;
            }
        }
    },
    spawnBullets : function() {
        for ( var i = 0; i < 2; i++) {
            if (Math.random() > .5) {
                i++;
            }
            // initialize:
            // function(x,y,heading,speed,scale,damage,seaks,gravityMultiplier,inAccuracy){

            ordinance.push(new Bullet(this.xPos, this.yPos, Math.PI, Math.random() * 10 + 15, .2, -1, 20, 0,
                    (180 / Math.PI) * 3));
        }
        // this.shouldSpawnBullets = false;
    },
    handleExisting : function() {
        if (this.xPos < 0 && this.xSpeed < 0 || this.xPos > fWidth && this.xSpeed > 0) {
            this.shouldExist = false;
        }
    },
    triggerHealthGive : function() {
        if (this.shouldExist) {
            this.shouldExist = false;
            this.hasProtection = false;
            this.shouldSpawnBullets = true;
        }
    },
    isCloseTo : function(x, y, xClose, yClose) {
        if (Math.abs(this.xPos - x) < xClose + 4 && Math.abs(this.yPos - y) < yClose + 4) {
            return true;
        } else {
            return false;
        }
    },
    drawSelf : function() {
        if (this.shouldExist || this.shouldSpawnBullets) {
            this.updateSelf();

            context.save();
            context.translate(this.xPos, fHeight - this.yPos);

            // Draw protective shield thing
            if (this.hasProtection) {
                context.lineWidth = 2;
                context.strokeStyle = "white";
                context.beginPath();
                context.arc(0, 0, 14, 0, Math.PI * 2, false);
                context.stroke();
            }

            // Draw happy plus thing
            if (this.scale > 0.01) {
                context.fillStyle = "rgb(" + this.coloring + "," + this.coloring + "," + this.coloring + ")";
                context.fillRect(-8 * this.scale, -3 * this.scale, 16 * this.scale, 6 * this.scale);
                context.fillRect(-3 * this.scale, -8 * this.scale, 6 * this.scale, 16 * this.scale);
            }
            context.restore();
        }
        if (this.shouldSpawnBullets) {
            this.spawnBullets();
        }
    }
});

var DepthCharge = new Class({
    initialize : function(x, y, damage, scale) {
        this.speed = 7;
        this.xPos = x;
        this.xSpeed = 0;
        this.yPos = y;
        this.ySpeed = 0;

        this.scale = 1;

        this.alpha = 1 * Math.random();
        this.lowerAlpha = .1;
        this.alphaGoing = 0;
        this.coloring = 0;

        this.shieldRotation = 0;

        this.shouldExist = true;
        this.hasProtection = true; // Remember kids, always use protection! You
        // don't want to get the AIDS!
    },
    die : function(killedBy) {
        if (this.hasProtection) {
            this.hasProtection = false;
            if (killedBy != "orbital") {
                player.stats["depthChargesDisarmed"]++;
            }
        }
    },
    updateAlpha : function() {
        if (this.hasProtection) {
            this.alpha += this.alphaGoing;
            if (this.alpha <= this.lowerAlpha && this.alphaGoing < 0 || this.alpha >= 1 && this.alphaGoing > 0) {
                this.alphaGoing *= -1;
            }
            if (this.alphaGoing < 0) {
                this.alphaGoing -= .015;
            } else {
                this.alphaGoing += .015;
            }
        } else {
            this.alpha = 1;
        }
        this.coloring = Math.round(255 * this.alpha);
    },
    updateSelf : function() {
        this.updateAlpha();
        this.handleExisting();
        if (!this.hasProtection) {
            this.ySpeed -= .8;
            this.scale *= .8;
            if (this.scale <= 0.1) {
                this.shouldExist = false;
                this.shouldSpawnBullets = false;
            }
        } else {
            if (this.ySpeed < -5) {
                this.hasProtection = false;
                this.spawnBullets();
            }
            this.ySpeed -= .1;
        }

        if (this.isCloseTo(player.xPos, player.yPos, 14, 14)) {
            if (this.hasProtection) {
                this.die();
            }
        }

        this.xPos += this.xSpeed;
        this.yPos += this.ySpeed;
    },
    distanceFrom : function(x, y) {
        if (!$chk(x)) {
            return Math.abs(this.yPos - y);
        } else if (!$chk(y)) {
            return Math.abs(this.xPos - x);
        } else {
            return Math.sqrt(Math.pow(this.xPos - x, 2) + Math.pow(this.yPos - y, 2));
        }
    },
    spawnBullets : function() {
        for ( var i = 0; i < 15; i++) {
            // initialize:
            // function(x,y,heading,speed,scale,damage,seaks,gravityMultiplier,inAccuracy){

            ordinance.push(new Bullet(this.xPos, this.yPos, Math.PI * 2, Math.random() * 4 + 7, .8, 5, 0, 0,
                    (180 / Math.PI) * 6, "depth"));
        }
        // this.shouldSpawnBullets = false;
    },
    handleExisting : function() {
        if (this.xPos < 0 && this.xSpeed < 0 || this.xPos > fWidth && this.xSpeed > 0) {
            this.shouldExist = false;
        }
    },
    triggerHealthGive : function() {
        if (this.shouldExist) {
            this.shouldExist = false;
            this.hasProtection = false;
            this.shouldSpawnBullets = true;
        }
    },
    isCloseTo : function(x, y, xClose, yClose) {
        if (Math.abs(this.xPos - x) < xClose + 4 && Math.abs(this.yPos - y) < yClose + 4) {
            return true;
        } else {
            return false;
        }
    },
    drawSelf : function() {
        if (this.shouldExist || this.shouldSpawnBullets) {
            this.updateSelf();

            context.save();
            context.translate(this.xPos, fHeight - this.yPos);

            context.fillStyle = "rgb(" + this.coloring + "," + this.coloring + "," + this.coloring + ")";
            // Draw protective shield thing
            if (this.hasProtection || this.scale > 0.01) {
                context.lineWidth = 2;
                context.strokeStyle = "white";
                context.beginPath();
                context.arc(0, 0, 10 * this.scale, 0, Math.PI * 2, false);
                context.fill();
            }

            // Draw happy plus thing
            /*
             * if(this.scale > 0 && false){ context.fillStyle =
             * "rgb("+this.coloring+","+this.coloring+","+this.coloring+")";
             * context.fillRect(-8*this.scale,-3*this.scale,16*this.scale,6*this.scale);
             * context.fillRect(-3*this.scale,-8*this.scale,6*this.scale,16*this.scale); }
             */
            context.restore();
        }
        if (this.shouldSpawnBullets) {
            this.spawnBullets();
        }
    }
});