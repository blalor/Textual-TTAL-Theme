/* Defined in: "Textual 5.app -> Contents -> Resources -> JavaScript -> API -> core.js" */

var mappedSelectedUsers = new Array();

Textual.viewFinishedLoading = function()
{
	Textual.fadeInLoadingScreen(1.00, 0.95);

	setTimeout(function() {
		Textual.scrollToBottomOfView()
	}, 500);
}

Textual.viewFinishedReload = function()
{
	Textual.viewFinishedLoading();
}

Textual.newMessagePostedToView = function(line)
{
    var element = document.getElementById("line-" + line);
    
    var senderElt = element.querySelector(".sender");
    
    // rewrite message for HipChat room announcements that aren't from a real
    // user (BitBucket, etc.)
    // if (false) {
    if ((senderElt !== null) && (senderElt.getAttribute("nickname") == "root")) {
        // app.printDebugInformationToConsole(line);
        var newHTML = "";
        
        // .message:
        /*
            <span class="message" ltype="privmsg">
                <span class="sender"
                      onclick="Textual.nicknameMaybeWasDoubleClicked(this)"
                      oncontextmenu="Textual.openStandardNicknameContextualMenu()"
                      mtype="normal"
                      nickname="root"
                      colornumber="26"
                >@root:</span>
                <span class="innerMessage">
                    Message from unknown participant XXX Status: XXX Status Page: [foouser] ACKNOWLEDGED: [baruser] misc: db stopped replicating? <a href="https://jira/browse/SYS-6845" class="url" oncontextmenu="Textual.openURLManagementContextualMenu()" onclick="return Textual.toggleInlineImage('4FE3D1BE-A095-4C95-A1E5-E2C3AF865DF8', true)">https://jira/browse/SYS-6845</a>
                </span>
            </span>
            
            <span class="message" ltype="privmsg">
                <span class="sender"
                      onclick="Textual.nicknameMaybeWasDoubleClicked(this)"
                      oncontextmenu="Textual.openStandardNicknameContextualMenu()"
                      mtype="normal"
                      nickname="root"
                      colornumber="26"
                >@root:</span>
                <span class="innerMessage">
                    Message from unknown participant Bitbucket: &lt;b&gt;yyyatxxx&lt;/b&gt; committed to 1 branch at &lt;a href="<a href="https://bitbucket.org/mycorp/myrepo/" class="url" oncontextmenu="Textual.openURLManagementContextualMenu()" onclick="return Textual.toggleInlineImage('4EDB23B5-96B1-484B-AA9B-2AB73357C4D7', true)">https://bitbucket.org/mycorp/myrepo/</a>"&gt;/mycorp/myrepo/&lt;/a&gt;&lt;br /&gt;&lt;b&gt;On branch "master"&lt;/b&gt;&lt;br /&gt; - Changed stuff.
                </span>
            </span>
        */

        // starting at "Message from …"
        var msg = element.querySelector(".innerMessage");
        var children = msg.childNodes;
        
        for (var c = 0; c < children.length; c++) {
            var child = children[c];

            if (child.nodeType === 3) {
                var senderMatch = child.textContent.match(/Message from unknown participant (.*?): (.*)$/);
                
                if (senderMatch !== null) {
                    var nick = senderMatch[1];
                    var msgRemainder = senderMatch[2];
                    
                    // update the nickname, without changing anything else
                    senderElt.setAttribute("nickname", nick);
                    senderElt.textContent = nick;
                    
                    newHTML += msgRemainder;
                } else {
                    newHTML += child.textContent;
                }
            } else if (child.nodeName === "A" && child.getAttribute("class") === "url") {
                /*
                <a href="{{{anchorLocation}}}"
                   class="url"
                   oncontextmenu="Textual.openURLManagementContextualMenu()"
                   {{#anchorInlineImageAvailable}}
                       onclick="return Textual.toggleInlineImage('{{anchorInlineImageUniqueID}}')"
                   {{/anchorInlineImageAvailable}}
                >{{{anchorTitle}}}</a>
                */

                newHTML += child.href;
            } else if (child.nodeName === "SPAN" && child.getAttribute("class") === "inlineImageCell") {
                // skip Textual's image munging embedded into the existing html
            } else {
                newHTML += child.innerHTML;
            }
        }
        
        msg.innerHTML = newHTML;
    }
    
    updateNicknameAssociatedWithNewMessage(element);
}

Textual.nicknameSingleClicked = function(e)
{
	userNicknameSingleClickEvent(e);
}

function updateNicknameAssociatedWithNewMessage(e)
{
	/* We only want to target plain text messages. */
	var elementType = e.getAttribute("ltype");

	if (elementType == "privmsg" || elementType == "action") {
		/* Get the nickname information. */
		var senderSelector = e.querySelector(".sender");

		if (senderSelector) {
			/* Is this a mapped user? */
			var nickname = senderSelector.getAttribute("nickname");

			/* If mapped, toggle status on for new message. */
			if (mappedSelectedUsers.indexOf(nickname) > -1) {
				toggleSelectionStatusForNicknameInsideElement(senderSelector);
			}
		}
	}
}

function toggleSelectionStatusForNicknameInsideElement(e)
{
	/* e is nested as the .sender so we have to go three parents
	 up in order to reach the parent div that owns it. */
	var parentSelector = e.parentNode.parentNode.parentNode;

	parentSelector.classList.toggle("selectedUser");
}

function userNicknameSingleClickEvent(e)
{
	/* This is called when the .sender is clicked. */
	var nickname = e.getAttribute("nickname");

	/* Toggle mapped status for nickname. */
	var mappedIndex = mappedSelectedUsers.indexOf(nickname);

	if (mappedIndex == -1) {
		mappedSelectedUsers.push(nickname);
	} else {
		mappedSelectedUsers.splice(mappedIndex, 1);
	}

	/* Gather basic information. */
    var documentBody = document.getElementById("body_home");

    var allLines = documentBody.querySelectorAll('div[ltype="privmsg"], div[ltype="action"]');

	/* Update all elements of the DOM matching conditions. */
    for (var i = 0, len = allLines.length; i < len; i++) {
        var sender = allLines[i].querySelectorAll(".sender");

        if (sender.length > 0) {
            if (sender[0].getAttribute("nickname") === nickname) {
				toggleSelectionStatusForNicknameInsideElement(sender[0]);
            }
        }
    }
}
