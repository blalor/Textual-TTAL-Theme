/* Defined in: "Textual.app -> Contents -> Resources -> JavaScript -> API -> core.js" */

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

// rewrite message for HipChat room announcements that aren't from a real user
// (BitBucket, etc.)
Textual.newMessagePostedToView = function(line)
{
    var element = document.getElementById("line-" + line);
    
    var senderElt = element.querySelector(".sender");
    
    if ((senderElt !== null) && (senderElt.getAttribute("nick") == "root")) {
        // app.printDebugInformationToConsole(line);
        var newHTML = "";
        
        // .message:
        /*
            <span class="message" ltype="privmsg" type="privmsg">
                <span class="sender"
                      onclick="Textual.nicknameSingleClicked()"
                      ondblclick="Textual.nicknameDoubleClicked()"
                      oncontextmenu="Textual.openStandardNicknameContextualMenu()"
                      ltype="normal"
                      type="normal"
                      nick="root"
                      colornumber="28"
                >
                    &lt;@root&gt;
                </span>
                Message from unknown participant Bitbucket: &lt;b&gt;Toby Lawrence&lt;/b&gt; committed to 1 branch at &lt;a href="<a href="https://bitbucket.org/bluestatedigital/chef/" class="url" oncontextmenu="Textual.openURLManagementContextualMenu()" onclick="return Textual.toggleInlineImage('86168707-F917-41B3-9CF4-CDBE19143C7E')">https://bitbucket.org/bluestatedigital/chef/</a>"&gt;/bluestatedigital/chef/&lt;/a&gt;&lt;br /&gt;&lt;b&gt;On branch "master"&lt;/b&gt;&lt;br /&gt; - Use updated Tracelytics cookbook.
            </span>
        */
        var msg = element.querySelector(".message");
        var children = msg.childNodes;
        
        // skip first text element and subsequent .sender; starting at "Message from …"
        for (var c = 2; c < children.length; c++) {
            var child = children[c];

            if (child.nodeType === 3) {
                var senderMatch = child.textContent.match(/Message from unknown participant (.*?): (.*)$/);
                
                if (senderMatch !== null) {
                    var nick = senderMatch[1];
                    var msgRemainder = senderMatch[2];
                    
                    newHTML += '<span class="sender" ltype="normal" type="normal" nick="' + nick + '" colornumber="5">[' + nick + ']</span> ' + msgRemainder;
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
            } else {
                newHTML += child.innerHTML;
            }
        }
        
        msg.innerHTML = newHTML;
    }
}
